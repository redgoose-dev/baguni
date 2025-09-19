/**
 * check exist value in object
 * @param {object} obj
 * @param {string[]} keys
 * @return {boolean}
 */
export function checkExistInObject(obj, keys)
{
  return keys.some(key => (key in obj) && obj[key] !== null && obj[key] !== undefined)
}

/**
 * parse json
 * @param {any} src
 * @return {any}
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
 * 배열 두개를 비교하여 추가, 중복, 삭제 상황의 값들을 가져올 수 있다.
 * @param {array} a
 * @param {array} b
 * @return {object}
 */
export function compareArrays(a, b)
{
  function filter(s)
  {
    return typeof s === 'string' ? s.trim() : s
  }
  return {
    added: b.filter(x => {
      return !!x && !a.includes(filter(x))
    }),
    duplicate: b.filter(x => {
      return !!x && a.includes(filter(x))
    }),
    removed: a.filter(x => {
      return !!x && !b.includes(filter(x))
    }),
  }
}

/**
 * remove undefined value key in object
 * @param {object} obj
 * @return {any}
 */
export function removeUndefinedValueKey(obj)
{
  return Object.fromEntries(Object.entries(obj)
    .filter(([_, value]) => value !== undefined))
}
