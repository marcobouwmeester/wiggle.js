import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import {resolve} from 'path';

const packageJson = require('./package.json');

const env = global.process.env || {};

export default defineConfig(({command}) => ({
    base: '/',
    root: './src',

    server: {
        port: env.DEVSERVER_PORT || 8080,
    },
    resolve: {
        alias: {
            /**
             * These aliases are used for the aws-cli
             */
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            process: 'process/browser',
            path: 'path-browserify',
            url: 'url',
        },
    },
    mode: 'development',
    build: {
        outDir: resolve(__dirname, 'dist'),
        sourcemap: 'inline',
        target: 'es2015',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
            },
        },
    },
    plugins: [tsconfigPaths()],
}));
