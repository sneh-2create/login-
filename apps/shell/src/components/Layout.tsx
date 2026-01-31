import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '@od-erp/ui';
import {
    useAppDispatch,
    useAppSelector,
    // toggleSidebar,
    setMenuConfig,
} from '@od-erp/store';

import { menuConfig } from '@od-erp/constants';

import { useAppInitialization } from '../hooks/useAppInitialization';

export const Layout: React.FC = () => {
    useAppInitialization();
    const dispatch = useAppDispatch();
    const { entityDetails } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Initialize Config
        if (menuConfig) {
            dispatch(setMenuConfig(menuConfig));
        } else {
            console.error('CRITICAL: MenuConfig is undefined in Layout');
        }
    }, [dispatch]);

    // Dynamic Theming
    useEffect(() => {
        if (entityDetails?.primaryColour) {
            document.documentElement.style.setProperty('--color-primary', entityDetails.primaryColour);
        } else {
            // Fallback to CSS default (remove override)
            document.documentElement.style.removeProperty('--color-primary');
        }

        if (entityDetails?.secondaryColour) {
            document.documentElement.style.setProperty('--color-secondary', entityDetails.secondaryColour);
        } else {
            // Fallback to CSS default
            document.documentElement.style.removeProperty('--color-secondary');
        }
    }, [entityDetails]);

    // const handleLogout = () => {
    //     dispatch(logout());
    // };

    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    if (isPrint) {
        return (
            <div className="min-h-screen bg-white w-full">
                <Outlet />
            </div>
        );
    }

    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar (Fixed Left, Full Height) */}
            <Sidebar collapsed={!isSidebarExpanded} />

            {/* Main Content Area (Header + Content) */}
            <div
                className="flex-1 min-w-0 flex flex-col h-full transition-all duration-300"
                style={{ marginLeft: isSidebarExpanded ? '265px' : '100px' }}
            >
                {/* Header (Fixed Top, to the right of sidebar) */}
                <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

                {/* Page Content */}
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
