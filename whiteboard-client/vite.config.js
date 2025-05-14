import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/create-room': 'https://real-time-whiteboards-server-project.onrender.com'
    }
  }
})


