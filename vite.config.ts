import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // NOTE: This exposes the key to client-side code at build/dev time.
      // Keep for MVP parity with AI Studio, but do NOT ship this approach to production.
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Local dev proxy for CV backend to avoid CORS.
        // Frontend calls /cv/* which is forwarded to CV_BACKEND_URL (default: http://localhost:4000).
        '/cv': {
          target: env.CV_BACKEND_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/cv/, ''),
        },
      },
    },
  };
});
