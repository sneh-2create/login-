import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, Header } from '@od-erp/ui';
import { BreadcrumbProvider } from '@od-erp/context';
import { store, useAppDispatch, useAppSelector, setMenuConfig, setPrimaryColor } from '@od-erp/store';
import { menuConfig } from '@od-erp/constants'
import { AuthGuard } from './components/AuthGuard'
import App from './App'
import '@od-erp/theme/index.css';
import './index.css'
import { initializeTheme, mapHexToThemeColor } from '@od-erp/utils';

// Initialize theme before React renders
const savedTheme = initializeTheme();
store.dispatch({ type: 'ui/setThemeConfig', payload: savedTheme });

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

    // Sync backend primary color with theme system
    useEffect(() => {
        if (entityDetails?.primaryColour) {
            const themeColor = mapHexToThemeColor(entityDetails.primaryColour);
            dispatch(setPrimaryColor(themeColor));
        }
    }, [entityDetails?.primaryColour, dispatch]);

    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    if (isPrint) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
                {children}
            </div>
        );
    }

    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);

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
                <Header
                    isSidebarExpanded={isSidebarExpanded}
                    onToggleSidebar={toggleSidebar}
                />

                {/* Page Content */}
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-2 md:p-6" style={{ background: 'var(--color-background)' }}>
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
