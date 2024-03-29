import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import createServiceWorkerPlugin from './plugins/create-service-worker.js'

const config = defineConfig(async ({ mode }) => {
  const { VITE_HOST, VITE_PORT, VITE_OPEN_BROWSER, VITE_OUT_DIR } = loadEnv(mode, process.cwd())
  return {
    server: {
      host: VITE_HOST,
      port: Number(VITE_PORT),
      open: VITE_OPEN_BROWSER === 'true',
    },
    build: {
      outDir: VITE_OUT_DIR || 'dist',
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            let ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext))
            {
              ext = 'images/'
            }
            else if (/css/.test(ext))
            {
              ext = 'css/'
            }
            else
            {
              ext = ''
            }
            return `assets/${ext}[name]-[hash][extname]`
          },
        },
      },
    },
    define: {},
    plugins: [
      vue({
        template: {
          compilerOptions: {},
        },
      }),
      // createServiceWorkerPlugin(),
    ],
  }
})

export default config
