import { rmdir } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout, exit } from 'node:process'
import { message } from './libs.js'

async function confirm()
{
  const rl = createInterface({
    input: stdin,
    output: stdout,
  })
  let answer = await rl.question('Do you really want to uninstall? (y/N) ')
  if (answer.toLowerCase() !== 'y')
  {
    message('error', 'You canceled the uninstall.')
    exit()
  }
  console.log('=====>', answer)
}

async function deleteDirectories()
{
  console.log('deleteDirectories()')
}

await confirm()
await deleteDirectories()
message('', 'Complete uninstall')
process.exit()
