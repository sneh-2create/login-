import apiClient from '../client';
import Cookies from 'js-cookie';

import { User } from '@od-erp/types';

const setAuthCookie = (token: string) => {
    const isSecure = window.location.protocol === 'https:';
    const hostname = window.location.hostname;
    // const domain = hostname.includes('oderp.in') ? '.oderp.in' : undefined;

    // For local, we explicitly set path to '/'. For live (domain exists), we rely on default behavior or explicit path if needed.
    // User requested: "for local we are giving path and for live not"
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    const options: Cookies.CookieAttributes = { secure: isSecure, sameSite: 'Lax' };

    if (!isLocal) {
        options.domain = '.oderp.in';
    } else {
        options.path = '/';
    }

    Cookies.set('token', token, options);
};

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
            setAuthCookie(response.data.token);
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
            setAuthCookie(response.data.token);
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
            setAuthCookie(response.data.token);
        }
        return response.data;
    },

    logout: async () => {
        // Clear cookies
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const options: Cookies.CookieAttributes = {};

        if (!isLocal) {
            options.domain = '.oderp.in';
        } else {
            options.path = '/';
        }
        Cookies.remove('token', options);
        // Clear local storage
        localStorage.clear();
    },
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh-token');
        if (response.data.token) {
            setAuthCookie(response.data.token);
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
