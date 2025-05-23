import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
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
