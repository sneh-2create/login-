import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header } from '@od-erp/ui';
import {
    useAppDispatch,
    // useAppSelector,
    // toggleSidebar,
    setMenuConfig,
} from '@od-erp/store';

import { menuConfig } from '../config/menu.config';

import { useAppInitialization } from '../hooks/useAppInitialization';

export const Layout: React.FC = () => {
    useAppInitialization();
    const dispatch = useAppDispatch();
    // const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
    // const user = useAppSelector((state) => state.auth.user); // Handled in Header
    // const { entityName, academicSession } = useAppSelector((state) => state.session);

    useEffect(() => {
        // Initialize Config
        dispatch(setMenuConfig(menuConfig));



    }, [dispatch]);

    // const handleLogout = () => {
    //     dispatch(logout());
    // };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Header (Fixed Top) */}
            <Header />

            {/* Sidebar (Fixed Left) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-[80px] ml-[100px] h-full transition-all duration-300">
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
