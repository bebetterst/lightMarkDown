import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: process.env.ELECTRON==='true' ? './' : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron', 'path', 'fs']
    }
  },
  optimizeDeps: {
    exclude: ['electron']
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  }
})