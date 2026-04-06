import api from './axios';

export const notificationApi = {
    getNotifications: () => api.get('/user/notifications'),
    getUnreadCount: () => api.get('/user/notifications/unread-count'),
    markAsRead: (notificationId) => api.put('/user/notifications/read', null, { params: { notificationId } }),
};
