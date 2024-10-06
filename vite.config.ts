import { defineConfig } from 'vite'
import path from 'path'

// https://qiita.com/sho03/items/6f4a191527f0f8a6ab1c

export default defineConfig({
  server: {
    port: 14000,
    strictPort: true,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
})