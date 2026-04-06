import api from './axios';

export const getApiBaseUrl = () => {
    const configuredBaseUrl = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:9092/api';
    return configuredBaseUrl.replace(/\/api\/?$/, '');
};

export const getAssetUrl = (url) => {
    if (!url) {
        return null;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const normalisedPath = url.startsWith('/') ? url : `/${url}`;
    return `${getApiBaseUrl()}${normalisedPath}`;
};
