import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_BACKEND_API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            await api.post('/auth/refresh');
            return api(originalRequest);
        }
        return Promise.reject(error);
    },
);

export default api;