import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // Un CSS y un JS por página (ver resources/views/pages/*).
            input: [
                'resources/css/pages/home.css',
                'resources/js/pages/home.js',
                'resources/css/pages/library.css',
                'resources/js/pages/library.js',
            ],
            refresh: true,
        }),
    ],
    server: {
        port: 4050,
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
        cors: true,
    },
});
