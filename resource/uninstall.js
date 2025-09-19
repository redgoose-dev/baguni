import { rm } from 'node:fs/promises'
import { message, prompt } from './libs.js'

const { DATA_PATH } = Bun.env

/**
 * 진행할것인지에 대한 확인
 * @return {Promise}
 */
async function confirm()
{
  let answer = await prompt('Do you really want to uninstall? [y/N]')
  if (answer.toLowerCase() !== 'y')
  {
    message('error', 'You canceled the uninstall.')
    process.exit()
  }
}

/**
 * 데이터 삭제
 * @return {Promise}
 */
async function deleteUserResource()
{
  await rm(DATA_PATH, { recursive: true })
  message('run', 'All data has been deleted.')
}

message('start', `Uninstall App`)
await confirm()
await deleteUserResource()
message('exit', 'Complete uninstall')
process.exit()
