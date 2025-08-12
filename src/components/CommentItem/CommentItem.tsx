import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import classes from './styles.module.scss';
import { Comment } from '../../Types';
import { updateComment, deleteComment, likeComment } from '../../store/comment';
import LikeIcon from "../../assets/svg/LikeIcon";

interface Props {
  comment: Comment;
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onUpdate?: () => void;
  currentUserId?: string;
}

const CommentItem: FC<Props> = ({ comment, onReply, onLike, onUpdate, currentUserId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const isLiking = useSelector((state: RootState) => 
    state.comments.loadingStates?.[comment._id]?.isLiking || false
  );
  const localLikeCount = comment.counts?.likes || 0;
  
  const hasLiked = comment.userInteraction?.isLiked === true;
  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleUpdateComment = async () => {
    if (!editContent.trim()) return;

    try {
      await dispatch(updateComment({ commentId: comment._id, content: editContent.trim() })).unwrap();
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(comment._id)).unwrap();
        onUpdate?.();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleLikeComment = async () => {
    if (!comment._id || isLiking) return;
    
    try {
      await dispatch(likeComment({ 
        commentId: comment._id, 
        isLiking: !hasLiked 
      })).unwrap();
      
  onLike(comment._id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const getUserName = () => {
    if (typeof comment.userId === 'string') return comment.userId;
    return comment.userId?.username || 'Unknown';
  };

  const getUserId = () => {
    if (typeof comment.userId === 'string') return comment.userId;
    return comment.userId?._id;
  };

  const isOwner = currentUserId && getUserId() === currentUserId;

  return (
    <div className={classes.comment}>
      <div className={classes.commentHeader}>
        <div className={classes.author}>
          <div className={classes.avatar}>
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <div className={classes.authorInfo}>
            <span className={classes.username}>{getUserName()}</span>
            <span className={classes.date}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className={classes.editForm}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className={classes.editTextarea}
            rows={3}
          />
          <div className={classes.editActions}>
            <button
              onClick={handleUpdateComment}
              disabled={!editContent.trim()}
              className={classes.saveBtn}
            >
              Save
            </button>
            <button onClick={handleCancelEdit} className={classes.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={classes.commentContent}>{comment.content}</div>
      )}

      <div className={classes.commentActions}>
        <button
          className={`${classes.likeBtn} ${hasLiked ? classes.liked : ''}`}
          onClick={handleLikeComment}
          disabled={isLiking}
        >
          <span className={classes.likeIcon}><LikeIcon/></span>
          <span className={classes.likeCount}>{localLikeCount}</span>
        </button>
        <button
          className={classes.replyBtn}
          onClick={() => onReply(comment._id)}
        >
          Reply
        </button>
        {isOwner && (
          <>
            <button
              className={classes.editBtn}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              className={classes.deleteBtn}
              onClick={handleDeleteComment}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentItem;