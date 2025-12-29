import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch, logout } from '@od-erp/store';
import Cookies from 'js-cookie';

export const ProtectedRoute: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const token = Cookies.get('token');

    // Strict Auth Check:
    // 1. Must be authenticated in Store (Persisted)
    // 2. Must have a valid Token in Cookies

    // Note: PersistGate in main.tsx ensures store is rehydrated before this runs.

    if (!isAuthenticated || !token) {
        // If there's a mismatch (e.g. token expired but store says auth, or vice versa), clean up.
        if (isAuthenticated || token) {
            dispatch(logout());
            Cookies.remove('token');
        }
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
