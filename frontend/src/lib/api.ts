import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    timeout: 10000, // Add timeout to prevent hanging requests
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(error);
        }

        // Handle 401 errors for token refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/logout') && // Add logout to excluded routes
            !originalRequest.url?.includes('/auth/me')
        ) {
            if (isRefreshing) {
                // If already refreshing, add to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/refresh');
                isRefreshing = false;
                processQueue(null, 'token_refreshed');
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                // Clear auth state on refresh failure
                if (typeof window !== 'undefined') {
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other common errors
        if (error.response?.status === 403) {
            console.error('Forbidden access');
            // You might want to show a permission denied message
        }

        if (error.response?.status >= 500) {
            console.error('Server error:', error.response.status);
        }

        return Promise.reject(error);
    }
);

export default api;