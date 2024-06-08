/**
 * 카멜케이스 문자로 변경
 * @param {string} str
 * @return {string}
 */
export function toPascalCase(str)
{
  return str.replace(/(\w)(\w*)(_|-|\s*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
}

/**
 * 숫자를 바이트 단위로 변경
 * @param {number} bytes
 * @return {string}
 */
export function getByte(bytes)
{
  const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ]
  if (bytes === 0) return '0 Byte'
  let i = Math.floor(Math.log(bytes) / Math.log(1024))
  return String(Math.round(bytes / Math.pow(1024, i))) + sizes[i]
}

/**
 * 숫자 한자리라면 앞에 `0`을 붙인다.
 * @param {number} n
 */
export function twoDigit(n)
{
  return `0${n}`.slice(-2)
}

/**
 * create random text
 * @param {number} length
 * @return {string}
 */
export function createRandomText(length)
{
  let result = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let len = characters.length
  for (let i = 0; i < length; i++)
  {
    result += characters.charAt(Math.floor(Math.random() * len))
  }
  return result
}
