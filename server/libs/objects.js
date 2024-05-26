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
    added: b.filter(x => (!!x && !a.includes(x.trim()))),
    duplicate: b.filter(x => (!!x && a.includes(x.trim()))),
    removed: a.filter(x => (!!x && !b.includes(x.trim()))),
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

/**
 * 배열속 객체의 순서 번호를 찾는다
 */
export function findObjectByKey(arr, keyName, value)
{
  return arr.findIndex(item => item[keyName] === value)
}

/**
 * 배열속 객체를 찾는다
 * @param {array} arr
 * @param {string|number} key
 * @param {string|number|boolean} value
 * @return {object}
 */
export function findObjectByValue(arr, key, value)
{
  return arr.find(obj => obj[key] === value)
}
