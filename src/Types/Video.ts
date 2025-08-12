export interface PostData {
  _id: string;
  userId: string | User; 
  title: string;
  type: 'video' | 'image' | 'text';
  description?: string;
  content?: string;
  src?: string;
  counts: {
    likes: number;
    views: number;
    comments: number;
  };
  userInteraction?: {
    isLiked: boolean;
    isViewed: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string | User;
  postId?: string;
  parentCommentId?: string;
  content: string;
  counts: {
    likes: number;
    children: number;
  };
  userInteraction?: {
    isLiked: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
}

export interface CommentsState {
  comments: { [postId: string]: Comment[] };
  replies: { [commentId: string]: Comment[] };
  currentComment: Comment | null;
  totalComments: number;
  pagination: {
    [postId: string]: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
  repliesPagination: {
    [commentId: string]: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
  loadingStates: {
    [commentId: string]: {
      isLiking: boolean;
    };
  };
}

export interface PostsState {
  posts: PostData[];
  currentPost: PostData | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    total: number;
  };
  searchQuery: string;
  loadingStates: {
    [postId: string]: {
      isLiking: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
}
