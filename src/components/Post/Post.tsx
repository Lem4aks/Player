import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, RefObject } from 'react';
import classes from './styles.module.scss';
import { VideoItem } from '../VideoItem';
import { postApi } from '../../api';
import { TextItem } from '../TextItem';
import { ImageItem } from '../ImageItem';
import Comments from '../Comments/Comments';

const Post = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: postId } = (location.state as { id: string }) || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [postData, setPostData] = useState<any>(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const fetchPostData = async () => {
    try {
      const response = await postApi.getPostById(String(postId));

      const post = response.post || response;

      setPostData(post);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      videoRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  };

  const handleLike = async () => {
    if (!postData || liking) return;

    try {
      setLiking(true);
      const response = await postApi.likePost(postData._id, true);

      const updatedPost = response.post || response;
      setPostData(updatedPost);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLiking(false);
    }
  };

  if (!postId || !postData) {
    return <div className={classes.container}>Post not found</div>;
  }

  const getAuthorName = () => {
    if (postData.userId) {
      return postData.userId.username || postData.userId.name || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div className={classes.container}>
      <div className={classes.videoSection}>
        <button className={classes.backBtn} onClick={handleBack}>
          ← Back
        </button>

        <div className={`${classes.videoContainer} ${isFullscreen ? classes.fullscreen : ''}`}>
          {postData.type === 'video' && (
            <VideoItem
              id={postData._id}
              src={postData.src || ''}
              title={postData.title}
              description={postData.description || ''}
              username={postData.userId?.username || 'Unknown'}
              onVideoClick={(videoId, videoElement) => toggleFullscreen()}
              videoRef={videoRef as RefObject<HTMLVideoElement>}
              isFullscreen={isFullscreen}
              showFullscreenControls={true}
            />
          )}

          {postData.type === 'image' && (
            <ImageItem
              id={postData._id}
              src={postData.src || ''}
              title={postData.title}
              description={postData.description || ''}
            />
          )}

          {postData.type === 'text' && (
            <TextItem id={postData._id} title={postData.title} content={postData.content || ''} />
          )}
        </div>

        <h1 className={classes.title}>{postData.title}</h1>

        <div className={classes.authorInfo}>
          <span>Author: {getAuthorName()}</span>
        </div>

        <div className={classes.stats}>
          <span>{postData.views || 0} views</span>
          <span>{postData.like || 0} likes</span>
          <button className={classes.likeButton} onClick={handleLike} disabled={liking}>
            {liking ? 'Like...' : 'Like'}
          </button>
        </div>

        <div className={classes.description}>
          <p>{postData.description}</p>
        </div>

        <Comments
          comments={postData.comments || []}
          postId={postData._id}
          onCommentsUpdate={fetchPostData}
        />
      </div>
    </div>
  );
};

export default Post;
