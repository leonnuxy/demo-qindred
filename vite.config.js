import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
    server: {
        port: 5173,
        host: true,
        https: true,
        cors: true,
        strictPort: true,
        hmr: {
            host: process.env.VITE_DEV_SERVER_HOST,
            protocol: 'wss',
            clientPort: 443
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
            manifest: true,
            buildDirectory: 'build'
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            // point “@” at your JS entry directory
            '@': resolve(__dirname, 'resources/js'),
            '@layouts': resolve(__dirname, 'resources/js/layouts'),
            '@components': resolve(__dirname, 'resources/js/components'),
            '@features': resolve(__dirname, 'resources/js/features'),
            '@css': resolve(__dirname, 'resources/css'),
            '@assets': resolve(__dirname, 'public/assets'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
