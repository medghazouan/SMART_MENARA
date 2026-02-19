import axiosInstance from './axios.config';

export const pannesAPI = {
  getAll: async (filters) => {
    const response = await axiosInstance.get('/pannes', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/pannes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/pannes', data);
    return response.data;
  },

  resolve: async (id, date_fin) => {
    const response = await axiosInstance.put(`/pannes/${id}/resolve`, {
      date_fin
    });
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async (filters) => {
    const response = await axiosInstance.get('/dashboard/stats', {
      params: filters
    });
    return response.data;
  },
};