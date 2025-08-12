import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, RefObject } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import classes from "./styles.module.scss";
import { PostItem } from "../PostItem";
import Comments from "../Comments/Comments";
import LikeIcon from "../../assets/svg/LikeIcon";
import Loading from "../Loading/Loading";
import { 
  fetchPostById, 
  likePost, 
  clearCurrentPost,
  selectCurrentPost,
} from "../../store/post";
import { fetchCommentsByPostId } from "../../store/comment";
import { PostData } from "../../Types/Video";

interface LocationState {
  id?: string;
}

const Post = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();  
  
  const { id: postId } = (location.state as LocationState) || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const currentPost = useAppSelector(selectCurrentPost) as PostData | null;
  const isLiking = useAppSelector(state => 
    postId ? state.posts.loadingStates[postId]?.isLiking : false
  );
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const commentsState = useAppSelector(state => state.comments);
  const commentsCount = commentsState.totalComments;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
      dispatch(fetchCommentsByPostId({ postId, page: 1, limit: 10 }));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  const toggleFullscreen = () => {
    const videoContainer = document.querySelector(`.${classes.videoContainer}`);
    if (!videoContainer) return;

    if (!isFullscreen) {
      videoContainer.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleLike = async () => {
    if (!currentPost || isLiking) return;

    try {
      const shouldLike = !currentPost.userInteraction?.isLiked;
      await dispatch(likePost({ 
        postId: currentPost._id, 
        isLiking: shouldLike 
      })).unwrap();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentsUpdate = () => {
    if (postId) {
      dispatch(fetchCommentsByPostId({ postId, page: 1, limit: 10 }));
    }
  };

  const getAuthorName = (): string => {
    if (!currentPost?.userId) return "Unknown";
    
    if (typeof currentPost.userId === "object" && currentPost.userId !== null) {
      const user = currentPost.userId as { username?: string; name?: string };
      return user.username || user.name || "Unknown";
    }
    return "Unknown";
  };

  if (!currentPost) {
    return (
      <div className={classes.container}>
        <div className={classes.loadingContainer}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.videoSection}>
        <button className={classes.backBtn} onClick={handleBack}>
          ← Back
        </button>

        <div
          className={`${classes.videoContainer} ${isFullscreen ? classes.fullscreen : ""}`}
        >
          <PostItem
            id={currentPost._id}
            postData={currentPost}
            type={currentPost.type}
            onVideoClick={() => toggleFullscreen()}
            videoRef={videoRef as RefObject<HTMLVideoElement>}
            isFullscreen={isFullscreen}
            showFullscreenControls={true}
          />
        </div>

        <h1 className={classes.title}>{currentPost.title}</h1>

        <div className={classes.authorInfo}>
          <span>Author: {getAuthorName()}</span>
        </div>

        <div className={classes.stats}>
          <span>{currentPost.counts?.views || 0} views</span>
          <span>{currentPost.counts?.likes || 0} likes</span>
          <span>{commentsCount} comments</span>
          <button
            className={`${classes.likeButton} ${currentPost.userInteraction?.isLiked ? classes.liked : ""}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <LikeIcon />
          </button>
        </div>

        <div className={classes.description}>
          <p>{currentPost.description}</p>
        </div>

        <Comments
          postId={currentPost._id}
          onCommentsUpdate={handleCommentsUpdate}
        />
      </div>
    </div>
  );
};

export default Post;