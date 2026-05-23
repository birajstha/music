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
        name: 'ChillPill',
        short_name: 'ChillPill',
        description: 'Music streaming — charts, radio, podcasts & learning.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0c0c18',
        background_color: '#0c0c18',
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
            urlPattern: /\/api\/youtube\//i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'youtube-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 120 },
            },
          },
          {
            urlPattern: /\/api\/proxy\?url=.*(podcast|rss|feed)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'podcast-rss-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 },
            },
          },
          {
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