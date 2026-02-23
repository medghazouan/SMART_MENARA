import axiosInstance from './axios.config';

export const carrieresAPI = {
  getAll: async (filters) => {
    const response = await axiosInstance.get('/carrieres', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/carrieres/${id}`);
    return response.data;
  },
};
