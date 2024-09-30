import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: { port: 4000, host: true },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
})