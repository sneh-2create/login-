import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import tsconfigPaths from 'vite-tsconfig-paths';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        federation({
            name: 'admission_crm',
            filename: 'remoteEntry.js',
            // Modules to expose
            exposes: {
                './App': './src/app.tsx',
            },
            shared: ['react', 'react-dom', 'react-router-dom', 'react-redux']
        })
    ],
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false
    },
    resolve: {
        alias: {
            '@od-erp/store': path.resolve(__dirname, '../../packages/store/src'),
            '@od-erp/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@od-erp/constants': path.resolve(__dirname, '../../packages/constants/src'),
        },
    },
    server: {
        port: 3001, // Admission CRM on port 3001
        cors: { origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] },
        proxy: {
            '/api': {
                target: 'https://staging.odpay.in',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    preview: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'https://staging.odpay.in',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
