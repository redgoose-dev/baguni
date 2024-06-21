/**
 * 태그의 정규식
 * @param {number} length 글자수
 * @return {RegExp}
 */
export function tagRegex(length = 20)
{
  return new RegExp(`^[a-zA-Z0-9-_]{1,${length}}$`)
}
