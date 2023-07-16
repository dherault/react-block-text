import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import analyze from 'rollup-plugin-analyzer'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'

const rollupPlugins = [rollupNodePolyFill()]

if (process.env.BUNDLE_ANALYSIS) {
  rollupPlugins.push(analyze({
    writeTo: string => {
      fs.writeFileSync(path.join(__dirname, 'bundle-analysis.txt'), string)
    },
  }))
}

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
      plugins: rollupPlugins,
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
