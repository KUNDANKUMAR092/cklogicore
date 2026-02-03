import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist', // Ye frontend folder ke andar hi dist banayega
  },
  server: {
    proxy: {
      // Jab bhi frontend '/api' hit karega, ye use backend server (port 5000) par redirect kar dega
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
