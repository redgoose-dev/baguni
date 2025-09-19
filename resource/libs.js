import { hashSync, genSaltSync } from 'bcryptjs'

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

/**
 * prompt
 *
 * @param {string} message
 * @return {Promise<string>}
 */
export async function prompt(message)
{
  process.stdout.write(`${message} `)
  for await (const line of console)
  {
    return line?.trim() || ''
  }
}

/**
 * 아이디 검증하기
 * @param {string} str
 * @return {boolean}
 */
export function verifyId(str)
{
  return /^[a-zA-Z0-9_-]+$/.test(String(str))
}

/**
 * 비밀번호 해시화하기
 * @param {string} password 비밀번호 문자
 */
export function hashPassword(password)
{
  const salt = genSaltSync(9)
  return hashSync(String(password), salt)
}

/**
 * 이메일 주소 검증하기
 * @param {string} address
 * @return {boolean}
 */
export function verifyEmail(address)
{
  if (!address) return false
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
  return emailRegex.test(String(address).toLowerCase())
}
