import { expect, test } from 'bun:test'

test.each(['install', 'listen-failure', 'invalid-db'])('시작 경계 조건: %s', async scenario => {
  const child = Bun.spawn([process.execPath, 'tests/fixtures/startup-scenario.js', scenario], { stdout: 'pipe', stderr: 'pipe' })
  const timer = setTimeout(() => child.kill('SIGKILL'), 4000)
  try
  {
    const [code, stderr] = await Promise.all([child.exited, new Response(child.stderr).text(), new Response(child.stdout).text()])
    expect(stderr).toBe('')
    expect(code).toBe(0)
  }
  finally
  {
    clearTimeout(timer)
    if (child.exitCode === null) child.kill('SIGKILL')
    await child.exited
  }
})
