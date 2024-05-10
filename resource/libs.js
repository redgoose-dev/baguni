import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

export const appName = 'BA.GU.NI'
export const basePath = 'user'

export function message(type, msg)
{
  switch (type)
  {
    case 'start':
      console.log('='.repeat(42))
      console.log('🪴', msg)
      console.log('='.repeat(42))
      break
    case 'error':
      console.error('❌', msg)
      break
    case 'exit':
      console.log('✅', msg)
      break
    case 'run':
      console.log('⌛', msg)
      break
    default:
      console.log(msg)
      break
  }
}

export async function prompt(message)
{
  const rl = createInterface({
    input: stdin,
    output: stdout,
  })
  const answer = await rl.question(`${message} `)
  rl.close()
  return answer
}

export async function multiplePrompt(messages)
{
  let result = []
  for (let message of messages)
  {
    result.push(await prompt(message))
  }
  return result
}
