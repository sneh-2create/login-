/// <reference types="vite/client" />
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
    (response) => {
        // Check for success responses that might contain session expiration message
        // This is common in some legacy API patterns
        if (response.data?.message === "Session Expired, Please Login again") {
            handleSessionExpiration();
            // Optionally reject here if we don't want the calling code to proceed
            return Promise.reject(new Error("Session Expired"));
        }
        return response;
    },
    (error) => {
        // Check for specific session expired message or 401 status
        const isSessionExpiredMessage = error.response?.data?.message === "Session Expired, Please Login again";
        if (isSessionExpiredMessage) {
            handleSessionExpiration();
        }
        // if (error.response?.status === 401 || isSessionExpiredMessage) {
        //     handleSessionExpiration();
        // }
        return Promise.reject(error);
    }
);

// Helper to handle cleanup and redirect
const handleSessionExpiration = () => {
    // Check if we are not already on the login page to avoid loops
    if (!window.location.pathname.includes('/login')) {
        // Clear token from cookie
        Cookies.remove('token');
        // Clear other storage
        localStorage.clear();
        // Redirect
        window.location.href = '/login';
    }
};
// You might dispatch a logout action if you had access to store here,
// but since store depends on api-client (sometimes), circular dependency is risk.
// Safest to redirect or emit an event.

export default apiClient;
