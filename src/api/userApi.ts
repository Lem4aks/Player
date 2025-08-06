import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL_BACK;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, credentials);
    return response.data;
  },

  register: async (userData: { username: string; name: string; email: string; password: string }) => {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
    return response.data;
  },

  getUserByUsername: async (username: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/users/username/${username}`);
    return response.data;
  },

  updateProfile: async (updateData: { name?: string; email?: string }) => {
    const response = await axios.put(`${API_BASE_URL}/api/users/profile`, updateData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  deleteProfile: async () => {
    const response = await axios.delete(`${API_BASE_URL}/api/users/profile`, {
      headers: getAuthHeaders()
      });
    return response.data;
  },
};
