import { defineConfig, loadEnv } from 'vite'
import preprocess from 'svelte-preprocess'
import { svelte } from '@sveltejs/vite-plugin-svelte'
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
            else if (/woff|woff2/.test(ext))
            {
              ext = 'fonts/'
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
      svelte({
        preprocess: preprocess(),
        extensions: [ '.svelte' ],
        compilerOptions: {},
        onwarn(warning, defaultHandler) {
          switch (warning.code)
          {
            case 'css-unused-selector':
            case 'a11y-label-has-associated-control':
            case 'unused-export-let':
              return
          }
          defaultHandler(warning)
        },
      }),
      // TODO: 서비스워커 플러그인
      // createServiceWorkerPlugin(),
    ],
  }
})

export default config
