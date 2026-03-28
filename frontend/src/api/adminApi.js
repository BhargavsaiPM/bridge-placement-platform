import api from './axios';

export const adminApi = {
    // Stats
    getStats: () => api.get('/admin/stats'),

    // Company Approvals
    getPendingCompanies: () => api.get('/admin/companies/pending'),
    approveCompany: (id) => api.post(`/admin/company/${id}/approve`),
    rejectCompany: (id) => api.post(`/admin/company/${id}/reject`),
    blockCompany: (id) => api.post(`/admin/company/${id}/block`),

    // User Approvals
    getPendingUsers: (type) => api.get(`/admin/users/pending?type=${type}`),
    approveUser: (id) => api.post(`/admin/user/${id}/approve`),
    rejectUser: (id) => api.post(`/admin/user/${id}/reject`),
    blockUser: (id) => api.post(`/admin/user/${id}/block`),

    // Verify Admin Password
    verifyPassword: (password) => api.post('/admin/verify-password', { password }),

    // Analytics
    getPlacementStats: () => api.get('/admin/placement-stats'),
    getStudentPerformance: () => api.get('/admin/student-performance'),
    getRecruiterEngagement: () => api.get('/admin/recruiter-engagement'),

    // Activity
    getActiveUsers: () => api.get('/admin/active-users'),
    getLoginLogs: () => api.get('/admin/login-logs'),
    getServerLoad: () => api.get('/admin/server-load'),

    // Management / Lists
    getAllUsers: () => api.get('/admin/users'),
    getAllCompanies: () => api.get('/admin/companies'),
    getAllJobs: () => api.get('/admin/jobs'),
    deleteUser: (id) => api.delete(`/admin/user/${id}`),
    deleteCompany: (id) => api.delete(`/admin/company/${id}`),
    deleteJob: (id) => api.delete(`/admin/job/${id}`),
    deleteOfficer: (id) => api.delete(`/admin/officer/${id}`),
    blockJob: (id) => api.post(`/admin/job/${id}/block`),
    unblockJob: (id) => api.post(`/admin/job/${id}/unblock`),

    // Kanban
    getStudentProgress: () => api.get('/admin/student-progress'),
    updateStudentProgress: (studentId, data) => api.put(`/admin/student-progress/${studentId}`, data),

    // Reports
    exportPdf: () => api.get('/admin/export/pdf', { responseType: 'blob' }),
    exportExcel: () => api.get('/admin/export/excel', { responseType: 'blob' }),

    // Profile
    getProfile: () => api.get('/admin/profile'),
    updateProfile: (data) => api.put('/admin/profile', data),
};
