import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts(), cssInjectedByJsPlugin()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            process: true,
            Buffer: false,
          },
        }),
      ],
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'react-block-text',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      plugins: [
        rollupNodePolyFill(),
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
