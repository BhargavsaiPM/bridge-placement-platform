import api from './axios';

export const officerApi = {
    getProfile: () => api.get('/officer/profile'),
    updateProfile: (data) => api.put('/officer/profile', data),

    // Jobs
    getJobs: () => api.get('/officer/jobs'),
    createJob: (data) => api.post('/officer/job', data),
    updateJob: (id, data) => api.put(`/officer/job/${id}`, data),
    closeJob: (id) => api.put(`/officer/job/${id}/close`)
};
