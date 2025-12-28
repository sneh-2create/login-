import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import Cookies from 'js-cookie';

export const ProtectedRoute: React.FC = () => {
    // Check initial auth state from cookie or store
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const token = Cookies.get('token');

    // If we have a token in cookie but not in store (e.g. refresh), we might want to try to validate/restore session
    // For now, simple check: token exists implies somewhat authenticated for route protection. 
    // Real validation happens via API client 401 interceptor.

    if (!token && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
