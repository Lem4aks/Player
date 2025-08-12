import classes from "./styles.module.scss";
import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useObserver } from "../../hooks/observer";
import { postApi } from "../../api/postApi";

interface Props {
  id: string;
  onView?: (postId: string) => Promise<void>;
}

const ImageItem: FC<Props> = ({ id, onView }) => {
  const navigate = useNavigate();
  const [fetchedPostData, setFetchedPostData] = useState<any>(null);

  useEffect(() => {
      const fetchPost = async () => {
        try {
          const response = await postApi.getPostById(id);
          const post = response.post;
          setFetchedPostData(post);
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      };
      
      fetchPost();
    }, [id]);

  const getAuthorName = () => {
    if (!fetchedPostData?.userId) return 'Unknown';
    if (typeof fetchedPostData.userId === 'object') {
      return fetchedPostData.userId.username || fetchedPostData.userId.name || 'Unknown';
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
    if (fetchedPostData) {
      navigate("/post", { 
        state: { 
          id, 
          title: fetchedPostData.title, 
          src: fetchedPostData.src, 
          description: fetchedPostData.description 
        } 
      });
    }
  };

  if (!fetchedPostData) {
    return <div>Loading...</div>
  }

  return (
    <div 
      ref={elementRef}
      className={classes.imageItem} 
      onClick={handleClick}
    >
      <h2 className={classes.title}>{fetchedPostData.title}</h2>
      <span className={classes.author}>By: {getAuthorName()}</span>
      <img src={fetchedPostData.src} alt={fetchedPostData.title} />
      <p className={classes.description}>{fetchedPostData.description}</p>
    </div>
  );
};

export default ImageItem;