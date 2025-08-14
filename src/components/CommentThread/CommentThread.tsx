import React, { FC, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/redux';
import classes from './styles.module.scss';
import { CommentItem } from '../CommentItem';
import { Comment } from '../../Types';
import { RootState } from '../../store';
import { fetchReplies } from '../../store/comment';

interface Props {
  comment: Comment;
  allComments: Comment[];
  onLike: (commentId: string) => void;
  onReply: (commentId: string, authorName?: string) => void;
  onUpdate: () => void;
  currentUserId?: string;
  level?: number;
}

const CommentThread: FC<Props> = ({
  comment,
  allComments,
  onLike,
  onReply,
  onUpdate,
  currentUserId,
  level = 0
}) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    replies: repliesByCommentId,
    repliesPagination 
  } = useSelector((state: RootState) => state.comments);
  
  const replies = repliesByCommentId[comment._id] || [];
  
  const directReplies = allComments.filter(
    reply => reply.parentCommentId === comment._id
  );
  
  const allRepliesMap = new Map();
  [...directReplies, ...replies].forEach(reply => {
    allRepliesMap.set(reply._id, reply);
  });
  const allReplies = Array.from(allRepliesMap.values());
  
  const hasReplies = (comment.counts?.children || 0) > 0 || allReplies.length > 0;
  const repliesCount = Math.max(comment.counts?.children || 0, allReplies.length);
  const pagination = repliesPagination[comment._id];
  const hasMoreReplies = pagination?.hasNextPage || false;

  const getCommentAuthorName = (comment: Comment): string => {
    if (typeof comment.userId === 'string') {
      return comment.userId;
    }
    return comment.userId?.username || 'Unknown';
  };

  const handleToggleReplies = async () => {
    if (!isExpanded && hasReplies) {
      dispatch(fetchReplies({ parentCommentId: comment._id }));
    }
    setIsExpanded(!isExpanded);
  };

  const handleLoadMoreReplies = () => {
    if (pagination && pagination.hasNextPage) {
      const nextPage = pagination.currentPage + 1;
      dispatch(fetchReplies({ 
        parentCommentId: comment._id, 
        page: nextPage 
      }));
    }
  };

  const handleReplyToComment = () => {
    onReply(comment._id, getCommentAuthorName(comment));
  };

  useEffect(() => {
    if (directReplies.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [directReplies.length]);

  const sortedReplies = allReplies.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={`${classes.commentThread} ${level > 0 ? classes.nestedComment : ''}`}>
      <div className={classes.commentWrapper}>
        <CommentItem
          comment={comment}
          onReply={handleReplyToComment}
          onUpdate={onUpdate}
          currentUserId={currentUserId}
        />
        
        {hasReplies && (
          <button
            className={classes.toggleRepliesBtn}
            onClick={handleToggleReplies}
          >
            {isExpanded ? (
              `▼ Hide ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`
            ) : (
              `▶ Show ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`
            )}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={classes.repliesContainer}>
          {sortedReplies.length > 0 ? (
            <>
              {sortedReplies.map(reply => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  allComments={allComments}
                  onLike={onLike}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
              
              {hasMoreReplies && (
                <button
                  onClick={handleLoadMoreReplies}
                  disabled={!hasMoreReplies}
                >
                  Load More Replies
                </button>
              )}
            </>
          ) : (
            <div className={classes.noReplies}>No replies yet</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentThread;