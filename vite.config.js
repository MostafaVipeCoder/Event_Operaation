import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase-lib';
          }
          if (id.includes('xlsx')) {
            return 'xlsx-lib';
          }
          if (id.includes('react')) {
            return 'react-core';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
