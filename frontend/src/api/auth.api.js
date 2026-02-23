import axiosInstance from './axios.config';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/login', credentials);
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post('/logout');
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  },
};