import { Database } from 'bun:sqlite'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

export async function installFixture(directory)
{
  await mkdir(`${directory}/cache`, { recursive: true })
  const preference = await Bun.file(new URL('../../resource/preference.json', import.meta.url)).json()
  preference._token = {
    accessSecret: 'test-only-access-secret', refreshSecret: 'test-only-refresh-secret',
    accessExpires: '1h', refreshExpires: '1d',
  }
  await Bun.write(`${directory}/preference.json`, JSON.stringify(preference))
  const fixture = new Database(`${directory}/db.sqlite`, { create: true })
  try
  {
    fixture.exec(await Bun.file(new URL('../../resource/seed.sql', import.meta.url)).text())
    fixture.run("INSERT INTO provider (code, user_id, user_name, created_at) VALUES ('password', 'test', 'Test', CURRENT_TIMESTAMP)")
    fixture.run("INSERT INTO asset (title, mode, created_at, updated_at) VALUES ('Public test', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
    const path = resolve(directory, 'test.png')
    const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'red' } }).png().toBuffer()
    await Bun.write(path, image)
    fixture.run("INSERT INTO file (path, name, type, size, module, module_id, mode, created_at) VALUES (?, 'test.png', 'image/png', ?, 'asset', 1, 'main', CURRENT_TIMESTAMP)", [path, image.length])
  }
  finally { fixture.close() }
}
