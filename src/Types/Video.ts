export interface PostData {
  _id: string;
  userId: string | User; 
  title: string;
  type: 'video' | 'image' | 'text';
  description?: string;
  content?: string;
  src?: string;
  comments?: Comment[];
  likes?: string[];
  views?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string | User;
  postId?: string;
  parentCommentId?: string;
  content: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}