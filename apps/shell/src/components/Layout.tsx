import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
        dispatch(setMenuConfig(menuConfig));
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
