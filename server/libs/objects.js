/**
 * check exist value
 * @param {object} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function checkExistValue(obj, keys)
{
  if (!(obj && keys)) return false
  for (const key of keys)
  {
    if (!(key in obj)) throw new Error(`There is no '${key}' entry.`)
  }
}

/**
 * parse json
 * @param {string} src
 * @return {object|array|null}
 */
export function parseJSON(src = '')
{
  try
  {
    if (!src) return null
    return JSON.parse(src)
  }
  catch (e)
  {
    throw new Error('JSON Parse error')
  }
}

/**
 * convert pure object
 * `proxy`, `observable`객체를 순수한 객체로 변환해준다.
 * TODO: 사용할 일이 있다면 사용하기
 */
export function pureObject(src)
{
  if (!src) return null
  try
  {
    return JSON.parse(JSON.stringify(src))
  }
  catch(_)
  {
    return null
  }
}
