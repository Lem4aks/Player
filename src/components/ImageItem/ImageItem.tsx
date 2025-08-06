import classes from "./styles.module.scss";
import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useObserver } from "../../hooks/observer";
import { postApi } from "../../api/postApi";

interface Props {
  id: string;
  onView?: (postId: string) => Promise<void>;
}

const ImageItem: FC<Props> = ({ id, onView }) => {
  const navigate = useNavigate();
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchPost = async () => {
        try {
          const response = await postApi.getPostById(id);
          const post = response.post;
          setPostData(post);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching post:', error);
          setLoading(false);
        }
      };
      
      fetchPost();
    }, [id]);

  const getAuthorName = () => {
    if (!postData?.userId) return 'Unknown';
    if (typeof postData.userId === 'object') {
      return postData.userId.username || postData.userId.name || 'Unknown';
    }
    return 'Unknown';
  };

  const { elementRef } = useObserver(
    id, 
    onView || (async () => {}),
    {
      threshold: 0.6,
      delay: 1200,
      rootMargin: '-15px'
    },
    !!onView
  );

  const handleClick = () => {
    if (postData) {
      navigate("/post", { 
        state: { 
          id, 
          title: postData.title, 
          src: postData.src, 
          description: postData.description 
        } 
      });
    }
  };

  if (loading) {
    return <div className={classes.imageItem}>Loading...</div>;
  }

  if (!postData) {
    return <div className={classes.imageItem}>Post not found</div>;
  }

  return (
    <div 
      ref={elementRef}
      className={classes.imageItem} 
      onClick={handleClick}
    >
      <h2 className={classes.title}>{postData.title}</h2>
      <span className={classes.author}>By: {getAuthorName()}</span>
      <img src={postData.src} alt={postData.title} />
      <p className={classes.description}>{postData.description}</p>
    </div>
  );
};

export default ImageItem;