import { FC, useState } from 'react';
import classes from './styles.module.scss';
import { Comment } from '../../Types/Video';
import { commentApi } from '../../api/commentApi';

interface Props {
  comment: Comment;
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onUpdate?: () => void;
  currentUserId?: string;
}

const CommentItem: FC<Props> = ({ comment, onReply, onLike, onUpdate, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likes?.length || 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateComment = async () => {
    if (!editContent.trim() || isUpdating) return;

    try {
      setIsUpdating(true);
      await commentApi.updateComment(comment._id, { content: editContent.trim() });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentApi.deleteComment(comment._id);
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
    console.log('handleLikeComment called, isLiking:', isLiking);
    
    if (isLiking) {
      console.log('Already liking, returning early');
      return;
    }

    try {
      console.log('Setting isLiking to true');
      setIsLiking(true);
      
      const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.userId;
        } catch (error) {
          return null;
        }
      };
      
      const currentUserId = getUserIdFromToken();
      
      const hasLiked = currentUserId && comment.likes && 
        comment.likes.some(likeUserId => 
          String(likeUserId) === String(currentUserId)
        );
      
      const isLiking = !hasLiked; 
      const response = await commentApi.likeComment(comment._id, { isLiking });    
      
      if (response.likesCount !== undefined) {
        setLocalLikeCount(response.likesCount);
      } else {
        setLocalLikeCount((prev: number) => isLiking ? prev + 1 : prev - 1);
      }
      
      if (response.comment && response.comment.likes) {
        comment.likes = response.comment.likes;
      } else {
        if (isLiking) {
          if (!comment.likes.includes(currentUserId)) {
            comment.likes.push(currentUserId);
          }
        } else {
          comment.likes = comment.likes.filter(id => String(id) !== String(currentUserId));
        }
      }
      
      onLike(comment._id);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      console.log('Setting isLiking to false, function completed');
      setIsLiking(false);
    }
  };

  const user =
    typeof comment.userId === 'string'
      ? { username: comment.userId, avatar: undefined }
      : comment.userId;

  const isOwner =
    currentUserId &&
    comment.userId &&
    (typeof comment.userId === 'string'
      ? comment.userId === currentUserId
      : comment.userId._id === currentUserId);

  return (
    <div className={classes.comment}>
      <div className={classes.commentHeader}>
        <div className={classes.author}>
          <div className={classes.avatar}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <span className={classes.username}>{user?.username || 'Unknown'}</span>
          <span className={classes.date}>{formatDate(comment.createdAt)}</span>
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
              disabled={!editContent.trim() || isUpdating}
              className={classes.saveBtn}
            >
              {isUpdating ? 'Saving...' : 'Save'}
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
          className={classes.likeBtn} 
          onClick={handleLikeComment}
          disabled={isLiking}
        >
          {isLiking ? 'Liking...' : `Like ${localLikeCount}`}
        </button>
        <button className={classes.replyBtn} onClick={() => onReply(comment._id)}>
          Reply
        </button>
        {isOwner && !isEditing && (
          <>
            <button className={classes.editBtn} onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button className={classes.deleteBtn} onClick={handleDeleteComment}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentItem;