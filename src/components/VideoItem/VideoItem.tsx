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
  onView,
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
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
      delay: 1500,
      rootMargin: '-20px'
    },
    !!onView
  );

  const handleVideoClick = () => {
    if (showFullscreenControls && videoRef?.current && fetchedPostData) {
      onVideoClick(id, videoRef.current);
    } else if (fetchedPostData) {
      navigate('/post', { state: { id, src: fetchedPostData.src, title: fetchedPostData.title } });
    }
  };

  const handleToggleFullscreen = () => {
    if (videoRef?.current) {
      onVideoClick(id, videoRef.current);
    }
  };

  if (!fetchedPostData) {
    return <div>Loading...</div>
  }

  return (
    <div 
      ref={elementRef}
      className={`${classes.videoItem} ${isFullscreen ? classes.fullscreen : ''}`}
    >
      {!isFullscreen && (
        <>
          <h2 className={classes.title}>{fetchedPostData.title}</h2>
          <p className={classes.author}>By: {getAuthorName()}</p><br />
          <span className={classes.description}>{fetchedPostData.description}</span>
        </>
      )}
      <div className={classes.videoContainer}>
        <video
          ref={videoRef}
          src={fetchedPostData.src}
          onClick={handleVideoClick}
          muted
          loop
          className={`${classes.video} ${isFullscreen ? classes.fullscreen : ''}`}
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