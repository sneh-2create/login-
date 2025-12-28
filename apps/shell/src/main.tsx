import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@od-erp/theme/index.css'; // Import shared styles + Tailwind
import './index.css'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '@od-erp/store';
import { QueryClientProvider, queryClient } from '@od-erp/query';


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </PersistGate>
    </React.StrictMode>,

)
