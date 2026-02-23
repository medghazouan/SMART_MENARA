import axiosInstance from './axios.config';

export const actionsAPI = {
  getByPanne: async (panneId) => {
    const response = await axiosInstance.get(`/pannes/${panneId}/actions`);
    return response.data;
  },

  create: async (panneId, data) => {
    const payload = {
      date: data.date_action || data.date,
      intervention: data.description || data.intervention,
      type: data.type || 'Corrective',
      temps_estime: data.temps_estime || null,
    };
    const response = await axiosInstance.post(`/pannes/${panneId}/actions`, payload);
    return response.data;
  },

  update: async (actionId, data) => {
    const response = await axiosInstance.put(`/actions/${actionId}`, data);
    return response.data;
  },

  delete: async (actionId) => {
    const response = await axiosInstance.delete(`/actions/${actionId}`);
    return response.data;
  },
};
