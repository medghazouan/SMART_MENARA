import axiosInstance from './axios.config';

export const notificationsAPI = {
  getAll: async (filters) => {
    const response = await axiosInstance.get('/notifications', { params: filters });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications?unread=true');
    return response.data?.length || 0;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },
};
