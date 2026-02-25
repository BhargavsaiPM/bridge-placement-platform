import api from './axios';

export const companyApi = {
    // Profile
    getProfile: () => api.get('/company/profile'),
    updateProfile: (data) => api.put('/company/profile', data),

    // Officers
    getOfficers: () => api.get('/company/officers'),
    createOfficer: (data) => api.post('/company/create-placement-officer', data),
    blockOfficer: (id) => api.put(`/company/officer/${id}/block`),
    unblockOfficer: (id) => api.put(`/company/officer/${id}/unblock`),
    getOfficerLogs: () => api.get('/company/officer/logs'),

    // Jobs
    getJobs: () => api.get('/company/jobs'),
    createJob: (data) => api.post('/company/job', data),
    updateJob: (id, data) => api.put(`/company/job/${id}`, data),
    closeJob: (id) => api.put(`/company/job/${id}/close`),
    getJobStats: (id) => api.get(`/company/job/${id}/stats`),

    // Applicants
    getJobApplications: (jobId) => api.get(`/company/job/${jobId}/applications`),
    updateApplicationStatus: (id, statusData) => api.put(`/company/application/${id}/status`, statusData),

    // Selected Students
    getSelectedStudents: () => api.get('/company/selected-students'),
    exportPdf: () => api.get('/company/export/pdf', { responseType: 'blob' }),
    exportExcel: () => api.get('/company/export/excel', { responseType: 'blob' }),

    // Analytics
    getHiresMonthly: () => api.get('/company/analytics/hires-monthly'),
    getSuccessRate: () => api.get('/company/analytics/success-rate'),
    getAppsPerJob: () => api.get('/company/analytics/apps-per-job'),
    getPackageRole: () => api.get('/company/analytics/package-role'),

    // Dashboard
    getDashboardStats: () => api.get('/company/dashboard'),
};
