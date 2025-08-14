import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentApi } from '../api/commentApi';
import { Comment, CommentsState } from '../Types/Video';

 const initialState: CommentsState = {
  totalComments: 0,
  comments: {},
  replies: {},
  currentComment: null,
  pagination: {},
  repliesPagination: {},
  loadingStates: {},
};

export const fetchCommentsByPostId = createAsyncThunk(
  'comments/fetchCommentsByPostId',
  async ({ postId, page = 1, limit = 10 }: { postId: string; page?: number; limit?: number }) => {
    const response = await commentApi.getCommentsByPostId(postId, page, limit);
    return { 
      comments: response.comments || response, 
      total: response.totalCount || response.total || 0, 
      page, 
      limit, 
      postId 
    };
  }
);

export const fetchReplies = createAsyncThunk(
  'comments/fetchReplies',
  async ({ parentCommentId, page = 1, limit = 10 }: { parentCommentId: string; page?: number; limit?: number }) => {
    const response = await commentApi.getReplies(parentCommentId, page, limit);
    return { ...response, parentCommentId, page };
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async (data: { content: string; postId?: string; parentCommentId?: string }) => {
    const response = await commentApi.createComment(data);
    return { ...response, originalData: data };
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const response = await commentApi.updateComment(commentId, { content });
    return response;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId: string) => {
    await commentApi.deleteComment(commentId);
    return commentId;
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async ({ commentId, isLiking }: { commentId: string; isLiking: boolean }) => {
    const response = await commentApi.likeComment(commentId, { isLiking });
    return {
      commentId,
      likesCount: response.likesCount ?? response.likes ?? response.count?.likes ?? 0,
      hasLiked: response.hasLiked ?? response.isLiked ?? !isLiking,
      ...response
    };
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
        const { postId, comments, page, total, limit } = action.payload;

        if (page === 1) {
          state.comments[postId] = comments;
        } else {
          state.comments[postId] = [...(state.comments[postId] || []), ...comments];
        }

        state.totalComments = total;
        state.pagination[postId] = {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
        };
      })

      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { parentCommentId, replies, page, total, limit } = action.payload;

        if (page === 1) {
          state.replies[parentCommentId] = replies;
        } else {
          state.replies[parentCommentId] = [...(state.replies[parentCommentId] || []), ...replies];
        }

        state.repliesPagination[parentCommentId] = {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
        };
      })

        .addCase(createComment.fulfilled, (state, action) => {
          const { comment: newComment, originalData } = action.payload;

          if (!newComment) return;

          if (originalData.postId && !originalData.parentCommentId) {
            if (!state.comments[originalData.postId]) {
              state.comments[originalData.postId] = [];
            }
            state.comments[originalData.postId] = [newComment, ...state.comments[originalData.postId]];
            state.totalComments += 1;
          } else if (originalData.parentCommentId) {
            if (!state.replies[originalData.parentCommentId]) {
              state.replies[originalData.parentCommentId] = [];
            }
            state.replies[originalData.parentCommentId] = [newComment, ...state.replies[originalData.parentCommentId]];

            if (originalData.postId && state.comments[originalData.postId]) {
              state.comments[originalData.postId] = [newComment, ...state.comments[originalData.postId]];
            }

            Object.keys(state.comments).forEach(postId => {
              const parentComment = state.comments[postId].find(c => c._id === originalData.parentCommentId);
              if (parentComment && parentComment.counts) {
                parentComment.counts.children = (parentComment.counts.children || 0) + 1;
              }
            });
          }
        })

      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload.comment;

        Object.keys(state.comments).forEach(postId => {
          const commentIndex = state.comments[postId].findIndex(c => c._id === updatedComment._id);
          if (commentIndex !== -1) {
            state.comments[postId][commentIndex] = { ...state.comments[postId][commentIndex], ...updatedComment };
          }
        });

        Object.keys(state.replies).forEach(parentId => {
          const replyIndex = state.replies[parentId].findIndex(r => r._id === updatedComment._id);
          if (replyIndex !== -1) {
            state.replies[parentId][replyIndex] = { ...state.replies[parentId][replyIndex], ...updatedComment };
          }
        });

        if (state.currentComment && state.currentComment._id === updatedComment._id) {
          state.currentComment = { ...state.currentComment, ...updatedComment };
        }
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;

        Object.keys(state.comments).forEach(postId => {
          const wasTopLevel = state.comments[postId].some(c => c._id === commentId && !c.parentCommentId);
          if (wasTopLevel) {
            state.totalComments -= 1;
          }
          state.comments[postId] = state.comments[postId].filter(c => c._id !== commentId);
        });

        Object.keys(state.replies).forEach(parentId => {
          state.replies[parentId] = state.replies[parentId].filter(r => r._id !== commentId);
        });

        if (state.currentComment && state.currentComment._id === commentId) {
          state.currentComment = null;
        }
      })


      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, likesCount, hasLiked } = action.payload;

        const updateCommentInArray = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                counts: {
                  ...comment.counts,
                  likes: likesCount ?? comment.counts?.likes ?? 0,
                },
                userInteraction: {
                  ...comment.userInteraction,
                  isLiked: hasLiked ?? comment.userInteraction?.isLiked ?? false,
                },
              };
            }
            return comment;
          });
        };

        Object.keys(state.comments).forEach(postId => {
          if (state.comments[postId]) {
            state.comments[postId] = updateCommentInArray(state.comments[postId]);
          }
        });

        Object.keys(state.replies).forEach(parentId => {
          if (state.replies[parentId]) {
            state.replies[parentId] = updateCommentInArray(state.replies[parentId]);
          }
        });

        if (state.currentComment && state.currentComment._id === commentId) {
          state.currentComment = {
            ...state.currentComment,
            counts: {
              ...state.currentComment.counts,
              likes: likesCount ?? state.currentComment.counts?.likes ?? 0,
            },
            userInteraction: {
              ...state.currentComment.userInteraction,
              isLiked: hasLiked ?? state.currentComment.userInteraction?.isLiked ?? false,
            },
          };
        }

        if (state.loadingStates[commentId]) {
          state.loadingStates[commentId].isLiking = false;
        }
      })
  },
});

export default commentsSlice.reducer;
