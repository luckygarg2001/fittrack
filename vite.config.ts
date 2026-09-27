import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'FitTrack',
        short_name: 'FitTrack',
        description: 'Personal fitness operating system',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        icons: [],
      },
    }),
  ],
})
