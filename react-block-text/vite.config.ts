import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'react-block-text',
    },
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(),
      ],
    },
  },
})
