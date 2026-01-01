import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        federation({
            name: 'shell',
            remotes: {
                // In production, this URL should be loaded from env or window config
                admission_crm: 'http://localhost:3001/assets/remoteEntry.js',
            },
            shared: ['react', 'react-dom']
        })
    ],
    build: {
        modulePreload: false,
        target: 'esnext',
        minify: false,
        cssCodeSplit: false
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://staging.odpay.in',
                changeOrigin: true,
                secure: false,
            },
            '/login': {
                target: 'https://staging.odpay.in',
                changeOrigin: true,
                secure: false,
                bypass: (req, res, options) => {
                    // If it's not a POST request (e.g. GET navigation), bypass the proxy
                    // so that the client-side router (React Router) handles it.
                    if (req.method !== 'POST') {
                        return req.url;
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            '@od-erp/store': path.resolve(__dirname, '../../packages/store/src'),
            '@od-erp/ui': path.resolve(__dirname, '../../packages/ui/src'),
            '@od-erp/constants': path.resolve(__dirname, '../../packages/constants/src'),
        },
        dedupe: ['react', 'react-dom'],
    },
})

