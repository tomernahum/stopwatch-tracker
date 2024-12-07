import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from "vite-plugin-pwa"


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // does not work in dev mode (would need to set up https), must build and preview.
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // defining cached files formats
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
      },
      // devOptions: {
      //   enabled: true,
      // },
    })

  ],
})
