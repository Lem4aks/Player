import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import classes from './styles.module.scss';
import { commentApi } from '../../api';
import { CommentItem } from '../CommentItem';
import { Comment } from '../../Types/Video';
import { RootState } from '../../store';

interface Props {
  comments: Comment[];
  postId: string;
  onCommentsUpdate: () => void;
}

const Comments: FC<Props> = ({ comments, postId, onCommentsUpdate }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToCommentAuthor, setReplyToCommentAuthor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [creatingComment, setCreatingComment] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState<Record<string, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleLikeComment = async (commentId: string) => {
    onCommentsUpdate();
    
    Object.keys(loadedReplies).forEach(parentId => {
      const replies = loadedReplies[parentId];
      if (replies.some(reply => reply._id === commentId)) {
        onCommentsUpdate();
      }
    });
  };

  const handleReply = (commentId: string, authorName?: string) => {
    setReplyToCommentId(commentId);
    setReplyToCommentAuthor(authorName || null);

    const commentInput = document.querySelector(
      'textarea[placeholder*="comment"]'
    ) as HTMLTextAreaElement;
    if (commentInput) {
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !postId || creatingComment) return;

    try {
      setCreatingComment(true);

      const commentData = {
        content: newComment.trim(),
        postId: postId,
        ...(replyToCommentId && { parentCommentId: replyToCommentId }),
      };

      await commentApi.createComment(commentData);

      // If it's a reply, refresh the replies for that comment
      if (replyToCommentId && loadedReplies[replyToCommentId]) {
        await loadReplies(replyToCommentId);
      } else {
        onCommentsUpdate();
      }

      setNewComment('');
      setReplyToCommentId(null);
      setReplyToCommentAuthor(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCreatingComment(false);
    }
  };

  const loadReplies = async (parentCommentId: string) => {
    if (loadingReplies[parentCommentId]) return;

    try {
      setLoadingReplies(prev => ({ ...prev, [parentCommentId]: true }));
      const response = await commentApi.getReplies(parentCommentId);
      setLoadedReplies(prev => ({ ...prev, [parentCommentId]: response.replies || [] }));
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [parentCommentId]: false }));
    }
  };

  const toggleReplies = async (commentId: string) => {
    const isCollapsed = !expandedComments.has(commentId);

    if (isCollapsed) {
      if (!loadedReplies[commentId]) {
        await loadReplies(commentId);
      }
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.add(commentId);
        return newSet;
      });
    } else {
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleUpdateReplies = async (parentCommentId: string) => {
    if (loadedReplies[parentCommentId]) {
      await loadReplies(parentCommentId);
    }
  };

  const getCommentAuthorName = (comment: Comment): string => {
    if (typeof comment.userId === 'string') {
      return comment.userId;
    }
    return comment.userId?.username || 'Unknown';
  };

  const getReplyCount = (commentId: string): number => {
    return comments.filter(c => c.parentCommentId === commentId).length;
  };
  const topLevelComments = comments.filter(comment => !comment.parentCommentId);

  return (
    <div className={classes.commentsSection}>
      <h2 className={classes.commentsHeader}>Comments ({comments.length})</h2>

      <div className={classes.commentForm}>
        <h3>Add comment</h3>
        {replyToCommentId && replyToCommentAuthor && (
          <div className={classes.replyContext}>
            <span>
              Replying to <strong>@{replyToCommentAuthor}</strong>
            </span>
          </div>
        )}
        <textarea
          placeholder={replyToCommentId ? 'Write a reply...' : 'Write a comment...'}
          rows={4}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className={classes.commentInput}
        />
        {replyToCommentId && (
          <div className={classes.replyInfo}>
            <span>Reply to comment</span>
            <button
              type='button'
              className={classes.cancelReply}
              onClick={() => {
                setReplyToCommentId(null);
                setReplyToCommentAuthor(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <button
          onClick={handleCreateComment}
          disabled={!newComment.trim() || creatingComment}
          className={classes.submitButton}
        >
          {creatingComment ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className={classes.commentsList}>
        {topLevelComments && topLevelComments.length > 0 ? (
          topLevelComments.map(comment => {
            const replyCount = getReplyCount(comment._id);
            const hasReplies = replyCount > 0;
            const isCollapsed = !expandedComments.has(comment._id);
            const replies = loadedReplies[comment._id] || [];
            const isLoadingReplies = loadingReplies[comment._id];

            return (
              <div key={comment._id} className={classes.commentWrapper}>
                <CommentItem
                  comment={comment}
                  onReply={commentId => handleReply(commentId, getCommentAuthorName(comment))}
                  onLike={handleLikeComment}
                  onUpdate={onCommentsUpdate}
                  currentUserId={user?._id}
                />

                {hasReplies && (
                  <button
                    className={classes.toggleRepliesBtn}
                    onClick={() => toggleReplies(comment._id)}
                    disabled={isLoadingReplies}
                  >
                    {isLoadingReplies
                      ? 'Loading...'
                      : !isCollapsed
                        ? '▼ Hide replies'
                        : `▶ Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                  </button>
                )}

                {!isCollapsed && replies.length > 0 && (
                  <div className={classes.repliesContainer}>
                    {replies.map(reply => (
                      <div key={reply._id} className={classes.replyWrapper}>
                        <CommentItem
                          comment={reply}
                          onReply={() => handleReply(comment._id, getCommentAuthorName(comment))}
                          onLike={handleLikeComment}
                          onUpdate={() => handleUpdateReplies(comment._id)}
                          currentUserId={user?._id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={classes.noComments}>No comments yet</div>
        )}
      </div>
    </div>
  );
};

export default Comments;
