import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/redux';
import classes from './styles.module.scss';
import { Comment } from '../../Types';
import { RootState } from '../../store';
import {CommentThread} from "../CommentThread";
import { checkAuthStatus } from '../../store/auth';
import { fetchCommentsByPostId, createComment } from '../../store/comment';

interface Props {
  postId: string;
  onCommentsUpdate: () => void;
}

const Comments: FC<Props> = ({ postId, onCommentsUpdate }) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    comments: commentsByPostId,
    pagination,
  } = useSelector((state: RootState) => state.comments || {});
  
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToCommentAuthor, setReplyToCommentAuthor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const comments = commentsByPostId[postId] || [];
  const postPagination = pagination[postId] || { currentPage: 0, totalPages: 0, hasNextPage: false };
  const hasMore = postPagination.hasNextPage;

  useEffect(() => {
    dispatch(checkAuthStatus());
    if (postId) {
      dispatch(fetchCommentsByPostId({ postId }));
    }
  }, [postId, dispatch]);

  const handleLoadMore = () => {
    const nextPage = (postPagination.currentPage || 0) + 1;
    dispatch(fetchCommentsByPostId({ postId, page: nextPage }));
  };

  const handleLikeComment = async (commentId: string) => {
    onCommentsUpdate();
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
    if (!newComment.trim() || !postId) return;

    try {
      const commentData = {
        content: newComment.trim(),
        postId: postId,
        ...(replyToCommentId && { parentCommentId: replyToCommentId }),
      };

      const result = await dispatch(createComment(commentData));
      
      if (createComment.fulfilled.match(result)) {
        setNewComment('');
        setReplyToCommentId(null);
        setReplyToCommentAuthor(null);
        
        await dispatch(fetchCommentsByPostId({ postId }));
        
        onCommentsUpdate();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const topLevelComments = comments.filter(comment => !comment.parentCommentId);

  const sortedTopLevelComments = topLevelComments.sort(
      (a: Comment, b: Comment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
      <div className={classes.commentsSection}>
        <h2 className={classes.commentsHeader}>Comments ({  comments.length})</h2>

        <div className={classes.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={classes.commentInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreateComment();
              }
            }}
          />
          {replyToCommentId && replyToCommentAuthor && (
              <div className={classes.replyContext}>
                <span>
                  Replying to <strong>@{replyToCommentAuthor}</strong>
                </span>
              </div>
          )}
          <button
            onClick={handleCreateComment}
            disabled={!newComment.trim()}
            className={classes.submitBtn}
          >
            Comment
          </button>
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
        </div>
        <div className={classes.commentsList}>
          {sortedTopLevelComments && sortedTopLevelComments.length > 0 ? (
              <>
                {sortedTopLevelComments.map((comment: Comment) => (
                    <CommentThread
                      key={comment._id}
                      comment={comment}
                      allComments={comments}
                      onLike={handleLikeComment}
                      onReply={handleReply}
                      onUpdate={() => {
                        dispatch(fetchCommentsByPostId({ postId }));
                        onCommentsUpdate();
                      }}
                      currentUserId={user?._id}
                      level={0}
                    />
                ))}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={!hasMore}
                    className={classes.loadMoreBtn}
                  >
                    Load More
                  </button>
                )}
              </>
          ) : (
              <div className={classes.noComments}>No comments yet</div>
          )}
        </div>
      </div>
  );
};

export default Comments;