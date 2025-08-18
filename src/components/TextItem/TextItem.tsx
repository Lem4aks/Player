import classes from "./styles.module.scss";
import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useObserver } from "../../hooks/observer";
import { postApi } from "../../api/postApi";

interface Props {
  id: string;
  onView?: (postId: string) => Promise<void>;
  isPreview?: boolean;
}

const TextItem: FC<Props> = ({ id, onView, isPreview = false }) => {
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
      threshold: 0.7,
      delay: 1000,
      rootMargin: '-10px'
    },
    !!onView
  );

  const handleClick = () => {
    if (fetchedPostData) {
      navigate("/post", { state: { id, title: fetchedPostData.title, content: fetchedPostData.content } });
    }
  };

  if (!fetchedPostData) {
    return <div>Loading...</div>
  }

  return (
    <div 
      ref={elementRef}
      className={classes.textItem} 
      onClick={handleClick}
    >
      <h2 className={classes.title}>{fetchedPostData.title}</h2>
      <p className={classes.author}>By: {getAuthorName()}</p>
      <span className={ classes.desription}>{fetchedPostData.description}</span>
      <span className={classes.content}>
        {isPreview && fetchedPostData.content ? 
          (fetchedPostData.content.length > 150 ? 
            fetchedPostData.content.substring(0, 150) + '...' : 
            fetchedPostData.content) : 
          fetchedPostData.content
        }
      </span>
    </div>
  );
};

export default TextItem;