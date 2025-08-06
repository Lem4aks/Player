import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL_BACK;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const postApi = {
  getAllPosts: async (page: number = 1, limit?: number) => {
    const params: any = { page };
    if (limit) {
      params.limit = limit;
    }

    const response = await axios.get(`${API_BASE_URL}/api/posts`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getPostById: async (postId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUserPosts: async (userId: string, page: number = 1, limit: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts/user/${userId}`, {
      params: { page, limit },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createPost: async (postData: {
    title: string;
    type: 'video' | 'image' | 'text';
    description?: string;
    src?: string;
    content?: string
  }) => {
    const response = await axios.post(`${API_BASE_URL}/api/posts`, postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  updatePost: async (postId: string, postData: {
    title?: string;
    type?: 'video' | 'image' | 'text';
    description?: string;
    src?: string;
    content?: string
  }) => {
    const response = await axios.put(`${API_BASE_URL}/api/posts/${postId}`, postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  likePost: async (postId: string, isLiking: boolean) => {
    const response = await axios.patch(`${API_BASE_URL}/api/posts/${postId}/like`,
      { isLiking },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  recordView: async (postId: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/view`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }
};