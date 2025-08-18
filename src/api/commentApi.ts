import axios from 'axios';
import { getAuthHeaders } from './helper';

const API_BASE_URL = process.env.REACT_APP_URL_BACK;

export const commentApi = {
  getCommentsByPostId: async (postId: string, page: number = 1, limit: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/post/${postId}?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getCommentById: async (commentId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/${commentId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getReplies: async (parentCommentId: string, page: number = 1, limit: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/comments/${parentCommentId}/replies?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createComment: async (data: { content: string; postId?: string; parentCommentId?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/api/comments`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  updateComment: async (commentId: string, data: { content: string }) => {
    const response = await axios.put(`${API_BASE_URL}/api/comments/${commentId}`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  likeComment: async (commentId: string, data: { isLiking: boolean }) => {
    const response = await axios.patch(`${API_BASE_URL}/api/comments/${commentId}/like`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },
};