import api from './axios';

export const officerApi = {
    getProfile: () => api.get('/officer/profile'),
    updateProfile: (data) => api.put('/officer/profile', data),
    changePassword: (data) => api.post('/officer/change-password', data),

    // Jobs
    getJobs: () => api.get('/officer/jobs'),
    getApplicationsForJob: (jobId, params = { page: 0, size: 100 }) =>
        api.get(`/officer/applications/${jobId}`, { params }),
    getApplicationById: (applicationId) => api.get(`/officer/application/${applicationId}`),
    updateApplicationStatus: (applicationId, status) =>
        api.put('/officer/application/status', null, { params: { applicationId, status } }),
    setApplicationRemark: (applicationId, data) =>
        api.put(`/officer/application/${applicationId}/remark`, data),
    getApplicationScore: (applicationId) => api.get(`/applications/${applicationId}/score`),
    getInterviewSlots: (applicationId) => api.get(`/officer/application/${applicationId}/interview-slots`),
    scheduleInterview: (applicationId, data) => api.post(`/officer/application/${applicationId}/schedule-interview`, data),
};
