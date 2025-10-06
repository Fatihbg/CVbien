import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true
    },
    define: {
        'process.env': {},
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://cvbien-backend-api-production.up.railway.app'),
        'import.meta.env.VITE_AUTH_API_URL': JSON.stringify('https://cvbien-backend-api-production.up.railway.app'),
        'import.meta.env.VITE_NODE_ENV': JSON.stringify('production')
    }
});
