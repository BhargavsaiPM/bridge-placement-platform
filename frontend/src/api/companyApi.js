import api from './axios';

export const companyApi = {
    // Profile
    getProfile: () => api.get('/company/profile'),
    updateProfile: (data) => api.put('/company/profile', data),

    // Officers
    getOfficers: () => api.get('/company/officers'),
    createOfficer: (data) => api.post('/company/create-placement-officer', data),
    blockOfficer: (id) => api.put(`/company/officer/${id}/deactivate`),
    unblockOfficer: (id) => api.put(`/company/officer/${id}/activate`),
    resetOfficerPassword: (id, data) => api.put(`/company/officer/${id}/reset-password`, data),

    // Jobs
    getJobs: () => api.get('/company/jobs'),
    createJob: (data) => api.post('/company/job', data),
    updateJob: (id, data) => api.put(`/company/job/${id}`, data),
    closeJob: (id) => api.put(`/company/job/${id}/close`),

    // Applicants
    getJobApplications: (jobId) => api.get(`/company/job/${jobId}/applications`),
    updateApplicationStatus: (id, statusData) => api.put(`/company/application/${id}/status`, statusData),

    // Selected Students
    getSelectedStudents: () => api.get('/company/selected-students'),

    // Dashboard
    getDashboardStats: () => api.get('/company/dashboard'),
};
