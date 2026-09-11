import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-jofi.png'],
      manifest: {
        name: 'JoFi Music',
        short_name: 'JoFi',
        description: 'Tu música, letras y controles en un solo lugar.',
        theme_color: '#075c70',
        background_color: '#0e1017',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\/api\/audio/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: { target: 'es2020', chunkSizeWarningLimit: 700 }
})
