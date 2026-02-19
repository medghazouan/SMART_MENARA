// src/api/materiels.api.js

import axiosInstance from './axios.config';

export const materielsAPI = {
  getAll: async (filters) => {
    const response = await axiosInstance.get('/materiels', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/materiels/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/materiels', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/materiels/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/materiels/${id}`);
    return response.data;
  },
};