import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL_BACK;

export const postApi = {
  getAllPosts: async (page: number = 1, limit: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts`, {
      params: { page, limit }
    });
    return response.data;
  },

  getPostById: async (postId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}`);
    return response.data;
  },

  getUserPosts: async (userId: string, page: number = 1, limit: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/posts/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  createPost: async (postData: { title: string; type: 'video' | 'image' | 'text'; description: string; src: string; content?: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/api/posts`, postData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updatePost: async (postId: string, postData: { title?: string; type?: 'video' | 'image' | 'text'; description?: string; src?: string; content?: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/posts/${postId}`, postData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deletePost: async (postId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  likePost: async (postId: string, increment: boolean) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_BASE_URL}/api/posts/${postId}/like`, 
      { increment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
}