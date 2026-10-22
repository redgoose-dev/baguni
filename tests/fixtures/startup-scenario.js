import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installFixture } from './database.js'

const directory = await mkdtemp(join(tmpdir(), 'baguni-startup-test-'))
process.env.DATA_PATH = directory
process.env.HOST = '127.0.0.1'
process.env.PORT = '0'
process.env.NODE_ENV = 'production'
const database = await import('../../server/libs/db.js')
let shutdown, occupied
try
{
  switch (process.argv[2])
  {
    case 'install': {
      assert.throws(() => database.connect())
      assert.equal(database.db, undefined)
      assert.equal(await Bun.file(`${directory}/db.sqlite`).exists(), false)
      ;({ shutdown } = await import('../../server/main.js'))
      const { pref } = await import('../../server/classes/Preference.js')
      const url = `http://127.0.0.1:${pref.server.port}/api/asset/`
      const unavailable = await fetch(url)
      assert.equal(unavailable.status, 503)
      await unavailable.text()
      assert.equal(database.db, undefined)
      await installFixture(directory)
      const installed = await fetch(url)
      assert.equal(installed.status, 401)
      await installed.text()
      assert.ok(database.db)
      break
    }
    case 'listen-failure': {
      await installFixture(directory)
      occupied = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => new Response('occupied') })
      process.env.PORT = String(occupied.port)
      await assert.rejects(import('../../server/main.js'))
      assert.equal(database.db, undefined)
      break
    }
    case 'invalid-db': {
      await Bun.write(`${directory}/preference.json`, '{}')
      await Bun.write(`${directory}/db.sqlite`, 'not a sqlite database')
      assert.throws(() => database.connect())
      assert.equal(database.db, undefined)
      await rm(`${directory}/db.sqlite`)
      await installFixture(directory)
      database.connect()
      assert.ok(database.db)
      break
    }
    default: throw new Error('Unknown scenario')
  }
}
finally
{
  if (shutdown) await shutdown()
  if (occupied) await occupied.stop(true)
  database.disconnect()
  await rm(directory, { recursive: true, force: true })
}
