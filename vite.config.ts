import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force the browser to never serve dev assets from cache, so a plain reload
    // always fetches freshly transformed modules (including ?raw GLSL).
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
