import { pref } from './classes/Preference.js'
import { isDev, openServer } from './libs/server.js'
import routes from './routes/index.js'
import error from './routes/etc/error.js'

const { serve } = Bun
const { HOST, PORT } = Bun.env
const server = {
  host: HOST,
  port: Number(PORT),
  dev: isDev(),
}

// setup preference
await pref.setup()

// start server
pref.server = serve({
  development: server.dev,
  port: server.port,
  hostname: server.host,
  routes,
  fetch: async (req, server) => {
    console.log('fetch()')
    return new Response('FOOFO')
  },
  error: error,
})

// open server message
openServer(pref.server)
