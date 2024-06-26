import { rm } from 'node:fs/promises'
import { exit } from 'node:process'
import { message, prompt, appName } from './libs.js'
import { dataPath } from '../server/libs/consts.js'

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
    exit()
  }
}

/**
 * 데이터 삭제
 * @return {Promise}
 */
async function deleteUserResource()
{
  await rm(dataPath, { recursive: true })
  message('run', 'All data has been deleted.')
}

message('start', `Uninstall ${appName}`)
await confirm()
await deleteUserResource()
message('exit', 'Complete uninstall')
exit()
