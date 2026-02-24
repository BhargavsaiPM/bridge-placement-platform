import api from './axios';

export const userApi = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    getApplications: () => api.get('/user/applications'),
    applyToJob: (jobId) => api.post(`/user/apply/${jobId}`),
};
