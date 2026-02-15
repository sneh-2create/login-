import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header, FloatingThemePicker } from '@od-erp/ui';
import {
    useAppDispatch,
    useAppSelector,
    // toggleSidebar,
    setMenuConfig,
    setPrimaryColor,
} from '@od-erp/store';
import { mapHexToThemeColor } from '@od-erp/utils';

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

    // Sync backend primary color with theme system
    useEffect(() => {
        if (entityDetails?.primaryColour) {
            const themeColor = mapHexToThemeColor(entityDetails.primaryColour);
            dispatch(setPrimaryColor(themeColor));
        }
    }, [entityDetails?.primaryColour, dispatch]);

    // const handleLogout = () => {
    //     dispatch(logout());
    // };

    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    if (isPrint) {
        return (
            <div className="min-h-screen w-full" style={{ background: 'var(--color-background)' }}>
                <Outlet />
            </div>
        );
    }

    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-muted)' }}>
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
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6" style={{ background: 'var(--color-background)' }}>
                    <Outlet />
                </main>

                {/* Floating Theme Picker */}
                <FloatingThemePicker />
            </div>
        </div>
    );
};
