import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import prerenderStatic from 'vite-plugin-prerender-static';

const staticRoutes = [
  {
    path: '/',
    tags: {
      title: 'HDM Bridge — Email & SMS API for Developers',
      description:
        'HDM Bridge lets developers send transactional email and SMS from their app via a simple API. 3,000 free emails/month, pay-as-you-go SMS. Built by HDM Technologies.',
    },
  },
  {
    path: '/login',
    tags: {
      title: 'Login — HDM Bridge',
      description: 'Sign in to your HDM Bridge account.',
    },
  },
  {
    path: '/register',
    tags: {
      title: 'Create Account — HDM Bridge',
      description: 'Create your HDM Bridge account and start sending transactional email and SMS from your project server.',
    },
  },
  {
    path: '/forgot-password',
    tags: {
      title: 'Reset Password — HDM Bridge',
      description: 'Reset your HDM Bridge account password.',
    },
  },
];

export default defineConfig({
  plugins: [
    react(),
    prerenderStatic({
      routes: staticRoutes,
      render: () => '<div id="root"></div>',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});