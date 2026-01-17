import apiClient from '../client';
import Cookies from 'js-cookie';

import { user } from '@od-erp/types';

export const authService = {
    // Legacy support (optional, can be removed if strictly following student login)
    login: async (credentials: any) => {
        // Legacy login is at the root domain, not under /api
        // We construct the root URL by removing '/api' from the baseURL if present
        const baseUrl = apiClient.defaults.baseURL || '';
        const rootUrl = baseUrl.replace(/\/api\/?$/, '');
        const loginUrl = `${rootUrl}/login`;

        const response = await apiClient.post(loginUrl, credentials);
        if (response.data.token) {
            const isSecure = window.location.protocol === 'https:';
            const hostname = window.location.hostname;
            const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;
            Cookies.set('token', response.data.token, { secure: isSecure, sameSite: 'Lax', domain });
        }
        return response.data;
    },

    sendOtp: async (mobile: string) => {
        const response = await apiClient.get(`/sendLogin/otp`, { params: { mobile } });
        return response.data;
    },

    verifyOtp: async (mobile: string, otp: string, source: string = 'erp') => {
        const response = await apiClient.get(`/verify/otp`, { params: { mobile, otp, source } });
        if (response.data.token) {
            const isSecure = window.location.protocol === 'https:';
            const hostname = window.location.hostname;
            const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;
            Cookies.set('token', response.data.token, { secure: isSecure, sameSite: 'Lax', domain });
        }
        return response.data;
    },

    // New APIs for Student Shell Login (Adjusting based on potential legacy paths, keeping as is for now unless broken)
    openEntityList: async () => {
        const response = await apiClient.get('/auth/openEntityList');
        return response.data;
    },

    getEntityByQac: async (qac: string) => {
        const response = await apiClient.get(`/auth/getEntityByQac/${qac}`);
        return response.data;
    },

    studentLogin: async (credentials: { phone: string; password: string; entity: string; session: string }) => {
        const response = await apiClient.post('/auth/student/login', credentials);
        if (response.data.token) {
            const isSecure = window.location.protocol === 'https:';
            const hostname = window.location.hostname;
            const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;
            Cookies.set('token', response.data.token, { secure: isSecure, sameSite: 'Lax', domain });
        }
        return response.data;
    },

    logout: async () => {
        // Clear cookies
        Cookies.remove('token');
        // Clear local storage
        localStorage.clear();
    },
    getProfile: async (): Promise<user> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh-token');
        if (response.data.token) {
            const isSecure = window.location.protocol === 'https:';
            const hostname = window.location.hostname;
            const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;
            Cookies.set('token', response.data.token, { secure: isSecure, sameSite: 'Lax', domain });
        }
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },
    fetchSession: async (entity: string, session: string) => {
        const response = await apiClient.get('/fetch/session', { params: { entity, session } });
        return response.data;
    }
}
