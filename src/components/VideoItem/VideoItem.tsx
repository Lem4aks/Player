import React, { useRef, FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller } from '../Controller';
import { useObserver } from '../../hooks/observer';
import classes from './Styles.module.scss';
import { postApi } from '../../api/postApi';

interface Props {
  id: string;
  onVideoClick: (videoId: string, videoElement: HTMLVideoElement) => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isFullscreen?: boolean;
  showFullscreenControls?: boolean;
  onView?: (postId: string) => Promise<void>;
}

const VideoItem: FC<Props> = ({
  id,
  onVideoClick,
  videoRef: externalVideoRef,
  isFullscreen = false,
  showFullscreenControls = false,
  onView
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
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
      delay: 1500,
      rootMargin: '-20px'
    },
    !!onView
  );

  const handleVideoClick = () => {
    if (showFullscreenControls && videoRef?.current && postData) {
      onVideoClick(id, videoRef.current);
    } else if (postData) {
      navigate('/post', { state: { id, src: postData.src, title: postData.title } });
    }
  };

  const handleToggleFullscreen = () => {
    if (videoRef?.current) {
      onVideoClick(id, videoRef.current);
    }
  };

  if (loading) {
    return (
      <div ref={elementRef} className={`${classes.videoItem}`}>
        Loading...
      </div>
    );
  }

  if (!postData) {
    return (
      <div ref={elementRef} className={`${classes.videoItem}`}>
        Post not found
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className={`${classes.videoItem}`}
    >
      {!isFullscreen && (
        <>
          <p className={classes.title}>{postData.title}</p>
          <span className={classes.author}>By: {getAuthorName()}</span><br />
          <span className={classes.description}>{postData.description}</span>
        </>
      )}
      <div className={classes.videoContainer}>
        <video
          ref={videoRef}
          src={postData.src}
          onClick={handleVideoClick}
          muted
          loop
          className={classes.video}
        />
        <div className={classes.inlineController}>
          <Controller
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            isFullscreen={isFullscreen}
            toggleFullscreen={handleToggleFullscreen}
            isInline={!showFullscreenControls}
          />
        </div>
      </div>

    </div>
  );
};

export default VideoItem;