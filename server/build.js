
// build server
await Bun.build({
  root: '.',
  entrypoints: [ './server/main.js' ],
  outdir: './dist',
  production: true,
  target: 'bun',
  format: 'esm',
  splitting: true,
  minify: true,
  external: [
    'bcryptjs',
    'image-size',
    'jsonwebtoken',
    'minimist',
    'sharp',
  ],
  naming: {
    entry: '[name].[ext]',
    chunk: 'chunk/[name]-[hash].[ext]',
    asset: 'asset/[name]-[hash].[ext]',
  },
  define: {
    'Bun.env.USE_BUILD': JSON.stringify(true),
  },
  plugins: [],
})
