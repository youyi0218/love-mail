// @ts-check
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import'

export default defineConfig({
  plugins: [
    react(),
    createStyleImportPlugin({
      resolves: [AntdResolve()],
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => `antd/es/${name}/style/index`
        }
      ]
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5520',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
  }
}) 