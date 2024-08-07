import { hashSync, compareSync, compare, genSaltSync } from 'bcrypt'

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
 * 비밀번호 검증하기
 * @param {string} password 문자로 된 패스워드 (비교할 문자)
 * @param {string} hashedPassword 해시 형태의 패스워드
 * @return {boolean}
 */
export function verifyPassword(password, hashedPassword)
{
  if (!(password && hashedPassword)) return false
  return compareSync(password, hashedPassword)
}

/**
 * 숫자 한자리라면 앞에 `0`을 붙인다.
 */
export function twoDigit(day)
{
  return `0${day}`.slice(-2)
}

/**
 * filtering title
 * @param {string} str
 * @return {string}
 */
export function filteringTitle(str)
{
  str = str.trim()
  return str
}
