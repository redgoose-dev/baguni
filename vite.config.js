import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { HOST, PORT, VITE_PORT } = Bun.env

const config = defineConfig(() => {
  return {
    root: 'client',
    publicDir: './public',
    base: '/',
    server: {
      host: HOST,
      port: Number(VITE_PORT),
      open: false,
      proxy: {
        '/api': {
          target: `http://0.0.0.0:${PORT}/api`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/?/, '/'),
        },
        '/file': {
          target: `http://0.0.0.0:${PORT}/file`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/file\/?/, '/'),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      outDir: '../dist/public',
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || ''
            let ext = info ? info[info.length - 1] : ''
            let subDir = ''
            if (/png|jpe?g|svg|gif|ico|webp|avif/i.test(ext)) subDir = 'images/'
            else if (/css/.test(ext)) subDir = 'css/'
            else if (/woff?2|ttf/i.test(ext)) subDir = 'fonts/'
            return `assets/${subDir}[name]-[hash][extname]`
          },
          codeSplitting: {
            groups: [
              {
                test: /node_modules\/vue/,
                name: 'vue',
              },
              {
                test: /node_modules\/vue-router/,
                name: 'vue-router',
              },
              {
                test: /node_modules\/pinia/,
                name: 'pinia',
              },
            ],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {},
        },
      }),
    ],
  }
})

export default config
