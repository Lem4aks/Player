import classes from "./styles.module.scss";
import { FC } from "react";
import TextItem from "../TextItem/TextItem";
import ImageItem from "../ImageItem/ImageItem";
import VideoItem from "../VideoItem/VideoItem";

interface Props {
  id: string;
  type: "video" | "text" | "image";
  onView?: (postId: string) => Promise<void>;
  onVideoClick?: (videoId: string, videoElement: HTMLVideoElement) => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isFullscreen?: boolean;
  showFullscreenControls?: boolean;
}

const PostItem: FC<Props> = ({ 
  id, 
  type, 
  onView, 
  onVideoClick, 
  videoRef, 
  isFullscreen = false, 
  showFullscreenControls = false 
}) => {
  const renderMediaItem = () => {
    switch (type) {
      case "text":
        return <TextItem id={id} onView={onView} />;
      case "image":
        return <ImageItem id={id} onView={onView} />;
      case "video":
        return (
          <VideoItem 
            id={id} 
            onVideoClick={onVideoClick || (() => {})} 
            videoRef={videoRef}
            isFullscreen={isFullscreen}
            showFullscreenControls={showFullscreenControls}
            onView={onView}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.postItem}>
      {renderMediaItem()}
    </div>
  );
};

export default PostItem;
