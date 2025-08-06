import classes from "./styles.module.scss";
import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useObserver } from "../../hooks/observer";
import { postApi } from "../../api/postApi";

interface Props {
  id: string;
  onView?: (postId: string) => Promise<void>;
}

const TextItem: FC<Props> = ({ id, onView }) => {
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
      threshold: 0.7,
      delay: 1000,
      rootMargin: '-10px'
    },
    !!onView
  );

  const handleClick = () => {
    if (postData) {
      navigate("/post", { state: { id, title: postData.title, content: postData.content } });
    }
  };

  if (loading) {
    return <div className={classes.textItem}>Loading...</div>;
  }

  if (!postData) {
    return <div className={classes.textItem}>Post not found</div>;
  }

  return (
    <div 
      ref={elementRef}
      className={classes.textItem} 
      onClick={handleClick}
    >
      <h2 className={classes.title}>{postData.title}</h2>
      <span className={classes.author}>By: {getAuthorName()}</span>
      <p className={classes.content}>{postData.content}</p>
      
    </div>
  );
};

export default TextItem;