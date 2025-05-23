import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            '@layouts': resolve(__dirname, 'resources/js/layouts'),
            '@components': resolve(__dirname, 'resources/js/components'),
            '@features': resolve(__dirname, 'resources/js/features'),
            '@css': resolve(__dirname, 'resources/css'),
            '@assets': resolve(__dirname, 'public/assets'),
        },
    },
    build: {
        outDir: 'public',
        assetsDir: 'assets',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    base: './',
});
