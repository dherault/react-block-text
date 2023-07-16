// import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     'react-block-text': path.resolve(__dirname, '../react-block-text'),
  //   },
  // },
  optimizeDeps: {
    exclude: ['react-block-text'],
  },
})
