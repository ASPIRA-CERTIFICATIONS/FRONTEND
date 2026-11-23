import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = process.env.VITE_DEV_API || 'http://localhost:5000';

// Absolute site URL for link-preview tags in index.html.
// Priority: VITE_SITE_URL (set it in Vercel when you add your own domain) → Vercel's production domain → final domain.
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  'https://aspiracertifications.com'
).replace(/\/$/, '');

const siteUrlInHtml = () => ({
  name: 'aspira-site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
});

export default defineConfig({
  plugins: [react(), siteUrlInHtml()],
  server: {
    port: 5173,
    proxy: {
      '/api': API,
      '/uploads': API,
      '/sitemap.xml': API,
      '/robots.txt': API,
    },
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'] },
      },
    },
  },
});
