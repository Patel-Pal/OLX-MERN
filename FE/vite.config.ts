import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   https: true, // Enable HTTPS
  // },
  // build: {
  //   chunkSizeWarningLimit: 1500 // Increase from default 500 KB to 1.5 MB
  // }
})
