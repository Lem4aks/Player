import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, RefObject } from "react";
import classes from "./styles.module.scss";
import { PostItem } from "../PostItem";
import { postApi } from "../../api";
import Comments from "../Comments/Comments";
import LikeIcon from "../../assets/svg/LikeIcon";
import Loading from "../Loading/Loading";

const Post = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: postId } = (location.state as { id: string }) || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

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

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPostById(String(postId));

      const post = response.post || response;
      const userInteraction = response.userInteraction;
      const counts = response.counts;

      setPostData(post);

      if (counts) {
        setLikesCount(counts.likes || 0);
        setViewsCount(counts.views || 0);
      } else if (post) {
        setLikesCount(post.likes?.length || 0);
        setViewsCount(post.views?.length || 0);
      }

      const getUserIdFromToken = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.userId;
        } catch (error) {
          console.error("Error decoding token:", error);
          return null;
        }
      };

      const currentUserId =
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        getUserIdFromToken();

      if (userInteraction && userInteraction.hasLiked !== undefined) {
        setHasLiked(userInteraction.hasLiked);
      } else if (post && post.likes && currentUserId) {
        const isLiked = post.likes.includes(currentUserId);
        setHasLiked(isLiked);
      } else {
        setHasLiked(false);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!postData || liking) return;

    try {
      setLiking(true);

      const isLiking = !hasLiked;

      const response = await postApi.likePost(postData._id, isLiking);

      if (response.likesCount !== undefined) {
        setLikesCount(response.likesCount);
      }

      if (response.hasLiked !== undefined) {
        setHasLiked(response.hasLiked);
      }

      if (response.post) {
        const updatedPost = {
          ...response.post,
          userId: postData.userId,
          comments: postData.comments,
        };
        setPostData(updatedPost);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLiking(false);
    }
  };

  const getAuthorName = () => {
    if (postData.userId) {
      if (typeof postData.userId === "object") {
        return postData.userId.username || postData.userId.name || "Unknown";
      } else {
        return "Unknown";
      }
    }
    return "Unknown";
  };

  if (!postId || !postData) {
    return <Loading />;
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
            id={postData._id}
            type={postData.type}
            onVideoClick={(videoId, videoElement) => toggleFullscreen()}
            videoRef={videoRef as RefObject<HTMLVideoElement>}
            isFullscreen={isFullscreen}
            showFullscreenControls={true}
          />
        </div>

        <h1 className={classes.title}>{postData.title}</h1>

        <div className={classes.authorInfo}>
          <span>Author: {getAuthorName()}</span>
        </div>

        <div className={classes.stats}>
          <span>{viewsCount} views</span>
          <span>{likesCount} likes</span>
          <button
            className={`${classes.likeButton} ${hasLiked ? classes.liked : ""}`}
            onClick={handleLike}
            disabled={liking}
          >
            <LikeIcon />
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
