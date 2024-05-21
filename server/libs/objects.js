/**
 * check exist value
 * @param {object} obj
 * @param {string[]} keys
 * @return {string}
 */
export function checkExistValue(obj, keys)
{
  if (!obj) return 'object'
  if (!(keys?.length > 0)) return 'keys'
  for (let i = 0; i < keys.length; i++)
  {
    const key = keys[i]
    if (!(key in obj) || obj[key] === null || obj[key] === undefined)
    {
      return key
    }
  }
  return ''
}

/**
 * check exist value in object
 * @param {object} obj
 * @param {string[]} keys
 * @return {boolean}
 */
export function checkExistValueInObject(obj, keys)
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

/**
 * 배열 두개를 비교하여 추가, 중복, 삭제 상황의 값들을 가져올 수 있다.
 * @param {array} a
 * @param {array} b
 * @return {object}
 */
export function compareArrays(a, b)
{
  return {
    added: b.filter(x => (!!x && !a.includes(x))),
    duplicate: b.filter(x => (!!x && a.includes(x))),
    removed: a.filter(x => (!!x && !b.includes(x))),
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
