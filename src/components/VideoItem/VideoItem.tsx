import React, { useRef, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller } from '../Controller';
import classes from './Styles.module.scss';

interface Props {
  id: string;
  src: string;
  title: string;
  description?: string;
  username?: string;
  onVideoClick: (videoId: string, videoElement: HTMLVideoElement) => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isFullscreen?: boolean;
  showFullscreenControls?: boolean;
}

const VideoItem: FC<Props> = ({ 
  id, 
  src, 
  title, 
  description, 
  username, 
  onVideoClick, 
  videoRef: externalVideoRef, 
  isFullscreen = false, 
  showFullscreenControls = false 
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const navigate = useNavigate();

  const handleVideoClick = () => {
    if (showFullscreenControls && videoRef?.current) {
      onVideoClick(id, videoRef.current);
    } else {
      navigate('/post', { state: { id, src, title } });
    }
  };

  const handleToggleFullscreen = () => {
    if (videoRef?.current) {
      onVideoClick(id, videoRef.current);
    }
  };

  return (
    <div className={`${classes.videoItem}`}>
      <p className={classes.title}>{title}</p>
      <span className={classes.author}>By: {username}</span><br></br>
      <span className={classes.description}>{description}</span>
      <div className={classes.videoContainer}>
        <video
          ref={videoRef}
          src={src}
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
