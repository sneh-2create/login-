import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, Header } from '@od-erp/ui'
import { store, useAppDispatch, setMenuConfig } from '@od-erp/store'
import { menuConfig } from '@od-erp/constants'
import { AuthGuard } from './components/AuthGuard'
import App from './App'
import '@od-erp/theme/index.css';
import './index.css'

// Standalone wrapper to initialize config and layout
const StandaloneLayout = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Initialize menu config for standalone mode
        if (menuConfig) {
            dispatch(setMenuConfig(menuConfig));
        }
    }, [dispatch]);

    const location = useLocation();
    const isPrint = location.pathname.includes('/print/');

    if (isPrint) {
        return (
            <div className="min-h-screen bg-white">
                {children}
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Header />
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col pt-[80px] ml-[100px] h-full transition-all duration-300">
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
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
                <Routes>
                    <Route path="/admission/*" element={
                        <StandaloneLayout>
                            <AuthGuard>
                                <App />
                            </AuthGuard>
                        </StandaloneLayout>
                    } />
                    <Route path="*" element={<Navigate to="/admission" replace />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
