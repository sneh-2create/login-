import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import Cookies from 'js-cookie';

export const PublicRoute: React.FC = () => {
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const token = Cookies.get('token');

    // If fully authenticated, redirect to dashboard
    if (isAuthenticated && token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
