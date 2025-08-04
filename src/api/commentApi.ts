import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL_BACK;

export const commentApi = {
  getCommentsByPostId: async (postId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/post/${postId}`);
    return response.data;
  },

  getCommentById: async (commentId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/${commentId}`);
    return response.data;
  },

  getReplies: async (parentCommentId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/${parentCommentId}/replies`);
    return response.data;
  },

  createComment: async (commentData: {
    content: string;
    postId?: string;
    parentCommentId?: string;
  }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/api/comments`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateComment: async (commentId: string, commentData: { content: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/api/comments/${commentId}`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  likeComment: async (commentId: string, increment: boolean) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_BASE_URL}/api/comments/${commentId}/like`,
      { increment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
