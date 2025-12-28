
import axios, { AxiosInstance } from 'axios';

import Cookies from 'js-cookie';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we are not already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                // Clear token from cookie
                Cookies.remove('token');
                // Clear other storage
                localStorage.clear();
                // Redirect
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
// You might dispatch a logout action if you had access to store here,
// but since store depends on api-client (sometimes), circular dependency is risk.
// Safest to redirect or emit an event.

export default apiClient;
