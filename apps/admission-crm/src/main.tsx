import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, Header } from '@od-erp/ui';
import { BreadcrumbProvider } from '@od-erp/context';
import { store, useAppDispatch, useAppSelector, setMenuConfig } from '@od-erp/store';
import { menuConfig } from '@od-erp/constants'
import { AuthGuard } from './components/AuthGuard'
import App from './App'
import '@od-erp/theme/index.css';
import './index.css'

// Standalone wrapper to initialize config and layout
const StandaloneLayout = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const { entityDetails } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Initialize menu config for standalone mode
        if (menuConfig) {
            dispatch(setMenuConfig(menuConfig));
        }
    }, [dispatch]);

    // Dynamic Theming
    useEffect(() => {
        if (entityDetails?.primaryColour) {
            document.documentElement.style.setProperty('--color-primary', entityDetails.primaryColour);
            document.documentElement.style.setProperty('--color-brand', entityDetails.primaryColour); // Ensure compatibility
        } else {
            // Fallback to CSS default (remove override)
            document.documentElement.style.removeProperty('--color-primary');
            document.documentElement.style.removeProperty('--color-brand');
        }

        if (entityDetails?.secondaryColour) {
            document.documentElement.style.setProperty('--color-secondary', entityDetails.secondaryColour);
        } else {
            // Fallback to CSS default
            document.documentElement.style.removeProperty('--color-secondary');
        }
    }, [entityDetails]);

    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    if (isPrint) {
        return (
            <div className="min-h-screen bg-white">
                {children}
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
                <Header
                    isSidebarExpanded={isSidebarExpanded}
                    onToggleSidebar={toggleSidebar}
                />

                {/* Page Content */}
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <BreadcrumbProvider>
                    <Routes>
                        <Route path="/admission/*" element={
                            <StandaloneLayout>
                                <AuthGuard>
                                    <App />
                                </AuthGuard>
                            </StandaloneLayout>
                        } />
                        <Route path="/print/*" element={
                            <StandaloneLayout>
                                <App />
                            </StandaloneLayout>
                        } />
                        <Route path="*" element={<Navigate to="/admission" replace />} />
                    </Routes>
                </BreadcrumbProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
