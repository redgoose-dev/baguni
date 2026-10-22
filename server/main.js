import { pref } from './classes/Preference.js'
import { isDev, openServer } from './libs/server.js'
import routes from './routes/index.js'
import error from './routes/etc/error.js'
import { connect, disconnect } from './libs/db.js'

const { serve } = Bun
const { HOST, PORT } = Bun.env
const server = {
  host: HOST,
  port: Number(PORT),
  dev: isDev(),
}

// setup preference
await pref.setup()

// 설치 전에는 서버만 시작한다. 설치된 서비스는 시작 시 연결 오류를 확인한다.
try
{
  if (pref.installed) connect()
  pref.server = serve({
    development: server.dev,
    port: server.port,
    hostname: server.host,
    routes,
    error: error,
  })
}
catch (error)
{
  disconnect()
  throw error
}

let shutdownPromise
export function shutdown()
{
  if (!shutdownPromise)
  {
    shutdownPromise = (async () => {
      // 진행 중인 요청의 DB 사용이 끝난 뒤 연결을 닫는다.
      await pref.server.stop(false)
      disconnect()
      process.off('SIGINT', handleSignal)
      process.off('SIGTERM', handleSignal)
    })()
  }
  return shutdownPromise
}

function handleSignal()
{
  shutdown().catch(error => {
    console.error('Failed to stop server:', error)
    process.exitCode = 1
  })
}

process.on('SIGINT', handleSignal)
process.on('SIGTERM', handleSignal)

// open server message
openServer(pref.server)
