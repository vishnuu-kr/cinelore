import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/reddit-proxy': {
          target: 'https://www.reddit.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/reddit-proxy/, ''),
          secure: false
        },
        '/rss-proxy': {
          target: 'https://news.google.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/rss-proxy/, ''),
          secure: false
        },
        '/reader-proxy': {
          target: 'https://r.jina.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/reader-proxy/, ''),
          secure: false
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.YOUTUBE_API_KEY': JSON.stringify(env.YOUTUBE_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
