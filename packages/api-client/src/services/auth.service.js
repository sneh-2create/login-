import apiClient from '../client';
import Cookies from 'js-cookie';
export const authService = {
    // Legacy support (optional, can be removed if strictly following student login)
    login: async (credentials) => {
        // Legacy login is at the root domain, not under /api
        // We construct the root URL by removing '/api' from the baseURL if present
        const baseUrl = apiClient.defaults.baseURL || '';
        const rootUrl = baseUrl.replace(/\/api\/?$/, '');
        const loginUrl = `${rootUrl}/login`;
        const response = await apiClient.post(loginUrl, credentials);
        if (response.data.token) {
            Cookies.set('token', response.data.token, { secure: true, sameSite: 'strict' });
        }
        return response.data;
    },
    sendOtp: async (mobile) => {
        const response = await apiClient.get(`/sendLogin/otp`, { params: { mobile } });
        return response.data;
    },
    verifyOtp: async (mobile, otp, source = 'erp') => {
        const response = await apiClient.get(`/verify/otp`, { params: { mobile, otp, source } });
        if (response.data.token) {
            Cookies.set('token', response.data.token, { secure: true, sameSite: 'strict' });
        }
        return response.data;
    },
    // New APIs for Student Shell Login (Adjusting based on potential legacy paths, keeping as is for now unless broken)
    openEntityList: async () => {
        const response = await apiClient.get('/auth/openEntityList');
        return response.data;
    },
    getEntityByQac: async (qac) => {
        const response = await apiClient.get(`/auth/getEntityByQac/${qac}`);
        return response.data;
    },
    studentLogin: async (credentials) => {
        const response = await apiClient.post('/auth/student/login', credentials);
        if (response.data.token) {
            Cookies.set('token', response.data.token, { secure: true, sameSite: 'strict' });
        }
        return response.data;
    },
    logout: async () => {
        // Clear cookies
        Cookies.remove('token');
        // Clear local storage
        localStorage.clear();
    },
    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh-token');
        if (response.data.token) {
            Cookies.set('token', response.data.token, { secure: true, sameSite: 'strict' });
        }
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },
    fetchSession: async (entity, session) => {
        const response = await apiClient.get('/fetch/session', { params: { entity, session } });
        return response.data;
    }
};
