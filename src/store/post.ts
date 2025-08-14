import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postApi } from '../api/postApi';
import { PostData,PostsState } from '../Types/Video';


const initialState: PostsState = {
  posts: [],
  currentPost: null,
  pagination: {
    currentPage: 1, 
    totalPages: 0,
    hasNextPage: false,
    total: 0,
  },
  searchQuery: '',
  loadingStates: {},
};

export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAllPosts',
  async ({ page = 1, limit = 10, loadMore = false }: { 
    page?: number; 
    limit?: number; 
    loadMore?: boolean; 
  }) => {
    const response = await postApi.getAllPosts(page, limit);
    const postsArray = response.posts || response;
    
    return { 
      posts: postsArray, 
      page, 
      limit, 
      loadMore,
      total: response.total || null,
      hasMoreData: postsArray.length === limit
    };
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: string) => {
    const response = await postApi.getPostById(postId);
    const post = response.post || response;
    
    return {
      ...post,
      userInteraction: response.userInteraction,
      counts: response.counts
    };
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: {
    title: string;
    type: 'video' | 'image' | 'text';
    description?: string;
    src?: string;
    content?: string;
  }) => {
    const response = await postApi.createPost(postData);
    return response.post || response;
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, data }: { postId: string; data: Partial<PostData> }) => {
    const response = await postApi.updatePost(postId, data);
    return response.post || response;
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    await postApi.deletePost(postId);
    return postId;
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ postId, isLiking }: { postId: string; isLiking: boolean }) => {
    const response = await postApi.likePost(postId, isLiking);
    return { 
      postId, 
      isLiking,
      likesCount: response.likesCount ?? response.counts?.likes,
      hasLiked: response.hasLiked ?? response.userInteraction?.isLiked,
      counts: response.counts,
      userInteraction: response.userInteraction
    };
  }
);

export const incrementPostViews = createAsyncThunk(
  'posts/incrementPostViews',
  async ({ postId, viewCount }: { postId: string; viewCount: number }) => {
    return { postId, viewCount };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        const { posts, page, limit, loadMore, total, hasMoreData } = action.payload;
        const postsArray = Array.isArray(posts) ? posts : [];
        
        if (loadMore && page > 1) {
          const uniquePosts = postsArray.filter((post: PostData) => 
            !state.posts.some(existingPost => existingPost._id === post._id)
          );
          state.posts = [...state.posts, ...uniquePosts];
        } else {
          state.posts = postsArray;
        }
        
        if (total !== null && total !== undefined) {
          const totalPages = Math.ceil(total / limit);
          state.pagination = {
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            total,
          };
        } else {
          state.pagination = {
            currentPage: page,
            totalPages: hasMoreData ? page + 1 : page,
            hasNextPage: hasMoreData,
            total: loadMore && page > 1 ? state.posts.length : postsArray.length,
          };
        }
      })
      
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
      })

        .addCase(createPost.fulfilled, (state, action) => {
          const newPost = action.payload;
          if (!newPost) return;

          state.posts = [newPost, ...state.posts];
          state.pagination.total += 1;
        })

      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        if (!updatedPost) return;
        
        const postIndex = state.posts.findIndex(post => post._id === updatedPost._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = { ...state.posts[postIndex], ...updatedPost };
        }
        
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = { ...state.currentPost, ...updatedPost };
        }
      })
      
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        
        state.posts = state.posts.filter(post => post._id !== postId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = null;
        }
        
        delete state.loadingStates[postId];
      })

      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likesCount, hasLiked, counts, userInteraction } = action.payload;
        
        const updatePostInArray = (posts: PostData[]): PostData[] => {
          return posts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                counts: {
                  ...post.counts,
                  likes: likesCount ?? counts?.likes ?? post.counts?.likes ?? 0,
                  views: counts?.views ?? post.counts?.views ?? 0,
                  comments: counts?.comments ?? post.counts?.comments ?? 0,
                },
                userInteraction: {
                  ...post.userInteraction,
                  isLiked: hasLiked ?? userInteraction?.isLiked ?? post.userInteraction?.isLiked ?? false,
                  isViewed: userInteraction?.isViewed ?? post.userInteraction?.isViewed ?? false,
                },
              };
            }
            return post;
          });
        };
        
        state.posts = updatePostInArray(state.posts);
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = {
            ...state.currentPost,
            counts: {
              ...state.currentPost.counts,
              likes: likesCount ?? counts?.likes ?? state.currentPost.counts?.likes ?? 0,
              views: counts?.views ?? state.currentPost.counts?.views ?? 0,
              comments: counts?.comments ?? state.currentPost.counts?.comments ?? 0,
            },
            userInteraction: {
              ...state.currentPost.userInteraction,
              isLiked: hasLiked ?? userInteraction?.isLiked ?? state.currentPost.userInteraction?.isLiked ?? false,
              isViewed: userInteraction?.isViewed ?? state.currentPost.userInteraction?.isViewed ?? false,
            },
          };
        }
        
        if (state.loadingStates[postId]) {
          state.loadingStates[postId].isLiking = false;
        }
      })
      
      .addCase(likePost.rejected, (state, action) => {
        const postId = action.meta.arg.postId;
        if (state.loadingStates[postId]) {
          state.loadingStates[postId].isLiking = false;
        }
      })
      
      .addCase(incrementPostViews.fulfilled, (state, action) => {
        const { postId, viewCount } = action.payload;
        
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          if (!state.posts[postIndex].counts) {
            state.posts[postIndex].counts = { likes: 0, views: 0, comments: 0 };
          }
          state.posts[postIndex].counts!.views = viewCount;
        }
        
        if (state.currentPost && state.currentPost._id === postId) {
          if (!state.currentPost.counts) {
            state.currentPost.counts = { likes: 0, views: 0, comments: 0 };
          }
          state.currentPost.counts.views = viewCount;
        }
      });
  },
});

export const { 
  clearCurrentPost, 
  setSearchQuery,
} = postsSlice.actions;

export const selectCurrentPost = (state: { posts: PostsState }) => state.posts.currentPost;
export const selectPostsPagination = (state: { posts: PostsState }) => state.posts.pagination;
export const selectSearchQuery = (state: { posts: PostsState }) => state.posts.searchQuery;

export const selectFilteredPosts = (state: { posts: PostsState }) => {
  const { posts, searchQuery } = state.posts;
  if (!searchQuery.trim()) return posts;
  
  const query = searchQuery.toLowerCase();
  return posts.filter((post) =>
    post.title.toLowerCase().includes(query) ||
    post.description?.toLowerCase().includes(query) ||
    post.content?.toLowerCase().includes(query)
  );
};

export default postsSlice.reducer;