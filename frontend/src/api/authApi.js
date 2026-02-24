import api from './axios';

export const authApi = {
    login: (data) => api.post('/auth/login', data),
    registerUser: (data) => api.post('/auth/register-user', data),
    registerCompany: (data) => api.post('/auth/register-company', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data), // { email }
    resetPassword: (data) => api.post('/auth/reset-password', data), // { email, otp, newPassword }
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};
