import { hashSync, compareSync, genSaltSync } from 'bcryptjs'
import { tables, getItem } from '../../libs/db.js'

export const PROVIDER_CODE = {
  PASSWORD: 'password',
}

/**
 * get provider
 * @param {number} id
 * @return {object}
 */
export function getProvider(id)
{
  const provider = getItem({
    table: tables.provider,
    where: `id = ${id}`,
  }).data
  return { ...provider, user_password: undefined }
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
