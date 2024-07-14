/**
 * 태그의 정규식
 * @param {number} length 글자수
 * @return {RegExp}
 */
export function tagRegex(length = 20)
{
  return new RegExp(`^[a-zA-Z0-9-_가-힣ㄱ-ㅎぁ-ゖァ-ヺー一-龯]{1,${length}}$`)
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
