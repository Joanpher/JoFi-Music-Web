import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PlayTube · Música completa',
        short_name: 'PlayTube',
        description: 'Reproductor de música completa desde YouTube Music, con letras y control desde notificaciones.',
        theme_color: '#0e1017',
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