import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    // Use mock token for development since Firebase auth has been temporarily removed
    const dummyToken = localStorage.getItem('dummy_auth_token') || 'dev-token-xyz';

    if (dummyToken) {
        config.headers.Authorization = `Bearer ${dummyToken}`;
    }
    return config;
});

export default api;
