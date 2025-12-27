import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const config: AxiosRequestConfig = {
    baseURL: '/api', // Relative path to work with proxy or same-domain API
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for HTTP-only cookies
};

const client: AxiosInstance = axios.create(config);

// Request interceptor
client.interceptors.request.use(
    (config) => {
        // You can add auth headers here if needed, 
        // but we are using HTTP-only cookies so mostly no need for Bearer token in headers
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
