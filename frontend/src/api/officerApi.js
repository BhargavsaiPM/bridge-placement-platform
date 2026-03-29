import api from './axios';

export const officerApi = {
    getProfile: () => api.get('/officer/profile'),
    updateProfile: (data) => api.put('/officer/profile', data),
    changePassword: (data) => api.post('/officer/change-password', data),

    // Jobs
    getJobs: () => api.get('/officer/jobs'),
    getApplicationsForJob: (jobId) => api.get(`/officer/applications/${jobId}`),
};
