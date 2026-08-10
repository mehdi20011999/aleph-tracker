import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works on GitHub Pages,
// Netlify, Vercel or from a plain file server without further configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist' }
})
