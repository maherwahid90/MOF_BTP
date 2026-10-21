import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the CAP server runs on :4004 (`npm run watch` in the project root).
// The production build goes into the approuter, which serves it and proxies /odata.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/odata': 'http://localhost:4004' }
  },
  build: {
    outDir: '../router/resources',
    emptyOutDir: true
  }
})
