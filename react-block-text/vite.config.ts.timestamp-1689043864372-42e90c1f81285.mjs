// vite.config.ts
import { defineConfig } from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/vite/dist/node/index.js";
import react from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/vite-plugin-dts/dist/index.mjs";
import cssInjectedByJsPlugin from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import rollupNodePolyFill from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/rollup-plugin-polyfill-node/dist/index.js";
import { nodeModulesPolyfillPlugin } from "file:///Users/sven/dev/react-rich-text/react-block-text/node_modules/esbuild-plugins-node-modules-polyfill/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react(), dts(), cssInjectedByJsPlugin()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            process: true,
            Buffer: false
          }
        })
      ]
    }
  },
  define: {
    global: "globalThis"
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "react-block-text"
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      plugins: [
        rollupNodePolyFill()
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc3Zlbi9kZXYvcmVhY3QtcmljaC10ZXh0L3JlYWN0LWJsb2NrLXRleHRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zdmVuL2Rldi9yZWFjdC1yaWNoLXRleHQvcmVhY3QtYmxvY2stdGV4dC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc3Zlbi9kZXYvcmVhY3QtcmljaC10ZXh0L3JlYWN0LWJsb2NrLXRleHQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXG5pbXBvcnQgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWNzcy1pbmplY3RlZC1ieS1qcydcbmltcG9ydCByb2xsdXBOb2RlUG9seUZpbGwgZnJvbSAncm9sbHVwLXBsdWdpbi1wb2x5ZmlsbC1ub2RlJ1xuaW1wb3J0IHsgbm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gJ2VzYnVpbGQtcGx1Z2lucy1ub2RlLW1vZHVsZXMtcG9seWZpbGwnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgZHRzKCksIGNzc0luamVjdGVkQnlKc1BsdWdpbigpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgbm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIEJ1ZmZlcjogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIGRlZmluZToge1xuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICB9LFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6ICdzcmMvaW5kZXgudHMnLFxuICAgICAgbmFtZTogJ3JlYWN0LWJsb2NrLXRleHQnLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHJvbGx1cE5vZGVQb2x5RmlsbCgpLFxuICAgICAgXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBleHBvcnRzOiAnbmFtZWQnLFxuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6ICdSZWFjdCcsXG4gICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLG9CQUFvQjtBQUMvVixPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sd0JBQXdCO0FBQy9CLFNBQVMsaUNBQWlDO0FBRzFDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0FBQUEsRUFDakQsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxTQUFTO0FBQUEsUUFDUCwwQkFBMEI7QUFBQSxVQUN4QixTQUFTO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsU0FBUyxXQUFXO0FBQUEsTUFDL0IsU0FBUztBQUFBLFFBQ1AsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
