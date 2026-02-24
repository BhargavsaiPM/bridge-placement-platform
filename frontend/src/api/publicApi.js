import api from './axios';

export const publicApi = {
    searchJobs: (location, type) => {
        let url = '/jobs/search';
        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (type) params.append('type', type);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        return api.get(url);
    },
    getJobDetails: (id) => api.get(`/jobs/${id}`) // Assuming this might be added later
};
