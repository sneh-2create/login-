import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@od-erp/theme/index.css'; // Import shared styles + Tailwind
import './index.css'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store, setThemeConfig } from '@od-erp/store';
import { QueryClientProvider, queryClient } from '@od-erp/query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initializeTheme } from '@od-erp/utils';

// Initialize theme before React renders
const savedTheme = initializeTheme();
store.dispatch(setThemeConfig(savedTheme));

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
                <App />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </PersistGate>
    </React.StrictMode>,

)
