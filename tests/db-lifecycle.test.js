import { afterAll, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { installFixture } from './fixtures/database.js'

// 서버 모듈은 환경변수 설정 후 동적으로 불러온다. 운영 data는 사용하지 않는다.
const directory = await mkdtemp(join(tmpdir(), 'baguni-db-test-'))
const previous = { ...process.env }
process.env.DATA_PATH = directory
process.env.HOST = '127.0.0.1'
process.env.PORT = '0'
process.env.NODE_ENV = 'production'
await installFixture(directory)
const { shutdown } = await import('../server/main.js')
const database = await import('../server/libs/db.js')
const { pref } = await import('../server/classes/Preference.js')
const { createToken } = await import('../server/libs/token.js')
const original = database.db
const access = createToken('access', { id: 1 }).value
original.run("INSERT INTO tokens (access, refresh, expired, created_at) VALUES (?, 'test-refresh', '2099-01-01', CURRENT_TIMESTAMP)", [access])
const base = `http://127.0.0.1:${pref.server.port}`
const headers = { authorization: access }

async function request(path, options = {})
{
  const response = await fetch(`${base}${path}`, { headers, ...options })
  const body = await response.text()
  return { status: response.status, body }
}

afterAll(async () => {
  await shutdown()
  await rm(directory, { recursive: true, force: true })
  for (const key of ['DATA_PATH', 'HOST', 'PORT', 'NODE_ENV'])
  {
    if (previous[key] === undefined) delete process.env[key]
    else process.env[key] = previous[key]
  }
})

test('동시 읽기와 읽기 후 쓰기가 같은 연결을 사용한다', async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => request('/api/asset/')))
  for (const result of results)
  {
    expect(result.status).toBe(200)
    expect(JSON.parse(result.body).data.total).toBe(1)
  }
  expect(database.db).toBe(original)
  const body = new FormData()
  body.set('title', 'New collection')
  expect((await request('/api/collection/', { method: 'PUT', body })).status).toBe(200)
  expect(original.query('SELECT title FROM collection').get().title).toBe('New collection')
  expect(database.db).toBe(original)
})

test('오류 응답과 공개 파일·다운로드도 연결을 닫지 않는다', async () => {
  expect((await request('/api/asset/', { headers: {} })).status).toBe(401)
  for (const path of ['/file/1/', '/file/1/download/', '/file/1/?w=2&h=2'])
  {
    const response = await fetch(`${base}${path}`)
    expect(response.status).toBe(200)
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata()
    expect(metadata.width).toBe(path.includes('?') ? 2 : 8)
    expect(database.db).toBe(original)
  }
})

test.each(['SIGINT', 'SIGTERM'])('%s는 DB를 닫고 정상 종료한다', async signal => {
  const child = Bun.spawn([process.execPath, 'tests/fixtures/signal-server.js'], {
    env: { ...process.env }, stdout: 'pipe', stderr: 'pipe',
  })
  const timer = setTimeout(() => child.kill('SIGKILL'), 4000)
  try
  {
    const reader = child.stdout.getReader()
    let output = ''
    while (!output.includes('TEST_READY'))
    {
      const { done, value } = await reader.read()
      if (done) throw new Error(`서버 시작 실패: ${output}`)
      output += new TextDecoder().decode(value)
    }
    reader.releaseLock()
    child.kill(signal)
    expect(await child.exited).toBe(0)
    expect(await new Response(child.stderr).text()).toBe('')
  }
  finally
  {
    clearTimeout(timer)
    if (child.exitCode === null) child.kill('SIGKILL')
    await child.exited
  }
})

test('로그아웃 후에도 다른 사용자의 연결과 토큰은 유지된다', async () => {
  const logoutAccess = createToken('access', { id: 1, session: 'logout' }).value
  original.run("INSERT INTO tokens (access, refresh, expired, created_at) VALUES (?, 'logout-refresh', '2099-01-01', CURRENT_TIMESTAMP)", [logoutAccess])
  expect((await request('/api/logout/', { method: 'POST', headers: { authorization: logoutAccess } })).status).toBe(200)
  expect(database.db).toBe(original)
  expect((await request('/api/asset/')).status).toBe(200)
})

test('다른 요청이 완료되어도 대기 중 요청의 연결을 유지하고 종료를 기다린다', async () => {
  const entered = Promise.withResolvers()
  const release = Promise.withResolvers()
  pref.server.reload({ routes: {
    '/test/slow': async () => {
      const connection = database.db
      entered.resolve()
      await release.promise
      return Response.json({ same: database.db === connection, count: connection.query('SELECT COUNT(*) AS count FROM asset').get().count })
    },
    '/test/fast': async () => {
      const handler = (await import('../server/routes/asset/get-index.js')).default
      return handler(new Request(`${base}/api/asset/`, { headers }), pref.server)
    },
  } })
  const pending = fetch(`${base}/test/slow`).then(response => response.json())
  await entered.promise
  try
  {
    expect((await request('/test/fast')).status).toBe(200)
    expect(database.db).toBe(original)
    const stopping = shutdown()
    expect(shutdown()).toBe(stopping)
    expect(database.db).toBe(original)
    release.resolve()
    expect(await pending).toEqual({ same: true, count: 1 })
    await stopping
    expect(database.db).toBeUndefined()
    expect(() => original.query('SELECT 1').get()).toThrow()
  }
  finally { release.resolve(); await pending }
})
