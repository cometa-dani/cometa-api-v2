import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// const host = 'localhost'
const host = '192.168.0.101'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public'
  },
  server: {
    proxy: {
      '/api/v1': `http://${host}:3000` // replace with your Express server's address
    }
  }
})
