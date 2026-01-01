import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
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

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Header />
            <Sidebar />
            <div className="flex-1 flex flex-col pt-[80px] ml-[100px] h-full transition-all duration-300">
                <main className="flex-1 overflow-y-auto p-6">
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
                <StandaloneLayout>
                    <AuthGuard>
                        <App />
                    </AuthGuard>
                </StandaloneLayout>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
)
