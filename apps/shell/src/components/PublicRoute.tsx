import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import Cookies from 'js-cookie';

export const PublicRoute: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector(state => state.auth);
    const token = Cookies.get('token');

    // Get redirect URL from query params
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');

    // If fully authenticated, redirect based on user type or requested redirect
    if (isAuthenticated && token && user) {
        if (redirectUrl) {
            // Handle external redirects (e.g. back to admission.oderp.in)
            if (redirectUrl.startsWith('http')) {
                window.location.href = redirectUrl;
                return null;
            }
            return <Navigate to={redirectUrl} replace />;
        }

        if (user.userType === 'od1') {
            return <Navigate to="/dashboard" replace />;
        } else if (['od2', 'od3'].includes(user.userType)) {
            return <Navigate to="/entity/dashboard" replace />;
        } else {
            // Fallback for students (od4) or others
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
