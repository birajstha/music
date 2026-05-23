import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'og-image.png'],
      manifest: {
        name: 'Evanié Music',
        short_name: 'Music',
        description: 'Free music streaming — genres, podcasts & learning',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['music', 'entertainment', 'education'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache Piped API responses via our proxy
            urlPattern: /\/api\/proxy\?url=.*piped/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'piped-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 120 },
            },
          },
          {
            // Cache podcast RSS via our proxy
            urlPattern: /\/api\/proxy\?url=.*(podcast|rss|feed|simplecast|megaphone|npr|feedburner)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'podcast-rss-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 },
            },
          },
          {
            // Cache thumbnails
            urlPattern: /\.(jpg|jpeg|png|webp|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 300, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
})
