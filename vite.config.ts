import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = mode === 'production' ? '/cysterciannum/' : '/';
  
  return {
    plugins: [react()],
    base,
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_AUTH_DOMAIN': JSON.stringify(env.VITE_AUTH_DOMAIN)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
            i18n: ['i18next', 'react-i18next']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      headers: {
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://*.github.io https://*.onrender.com; img-src 'self' data: https:; connect-src 'self' http://localhost:* https://*.github.io https://*.onrender.com"
      }
    }
  };
});
