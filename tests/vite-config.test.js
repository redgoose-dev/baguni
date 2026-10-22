import { expect, test } from 'bun:test'

// Bun의 자동 .env 로딩 없이도 Vite 설정이 환경 파일을 읽어야 한다.
test('Vite가 환경 파일에서 개발 포트와 프록시 포트를 읽는다', async () => {
  const env = { ...process.env }
  for (const key of ['HOST', 'PORT', 'VITE_PORT']) delete env[key]
  const child = Bun.spawn([process.execPath, '--no-env-file', '-e', `
    import assert from 'node:assert/strict';
    import { loadConfigFromFile, loadEnv } from 'vite';
    const expected = loadEnv('development', process.cwd(), '');
    const { config } = await loadConfigFromFile({ command: 'serve', mode: 'development' });
    assert.equal(config.server.port, Number(expected.VITE_PORT || 5173));
    assert.ok(Number.isInteger(config.server.port));
    assert.equal(config.server.proxy['/api'].target, 'http://0.0.0.0:' + Number(expected.PORT || 80) + '/api');
  `], { env, stdout: 'pipe', stderr: 'pipe' })
  const [code, stderr] = await Promise.all([child.exited, new Response(child.stderr).text()])
  expect(stderr).toBe('')
  expect(code).toBe(0)
})
