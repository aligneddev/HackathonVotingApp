import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/presentations': 'http://localhost:5050',
      '/votes': 'http://localhost:5050',
      '/leaderboard': 'http://localhost:5050',
      '/health': 'http://localhost:5050',
      '/admin': {
        target: 'http://localhost:5050',
        bypass(req) {
          // Browser navigation sends Accept: text/html — serve the SPA instead of proxying
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    }
  }
});
