function isObject(item)
{
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * convert pure object
 * `proxy`, `observable`객체를 순수한 객체로 변환해준다.
 */
export function pureObject(src)
{
  try
  {
    if (!src) throw new Error('no src')
    try
    {
      return structuredClone(src)
    }
    catch (e)
    {
      return JSON.parse(JSON.stringify(src))
    }
  }
  catch(_)
  {
    return null
  }
}

/**
 * parse object
 * @param {string} src
 * @return {object|array}
 */
export function parseObject(src)
{
  try
  {
    if (!src) throw new Error('no src')
    return JSON.parse(src)
  }
  catch (e)
  {
    return {}
  }
}

/**
 * 객체 깊은병합
 * @param {object} target
 * @param {object} source 같은 키라면 이 값으로 덮어쓴다.
 * @return {object}
 */
export function deepMerge(target, source)
{
  let output = Object.assign({}, target)
  if (isObject(target) && isObject(source))
  {
    Object.keys(source).forEach(key => {
      if (isObject(source[key]))
      {
        if (!(key in target))
        {
          Object.assign(output, { [key]: source[key] })
        }
        else
        {
          output[key] = deepMerge(target[key], source[key])
        }
      }
      else
      {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

/**
 * 배열 속 객체의 인덱스 번호를 가져온다.
 * @param {array} arr
 * @param {string|number} keyName
 * @param {string|number|boolean} value
 * @return {number}
 */
export function findObjectByKey(arr, keyName, value)
{
  return arr.findIndex(item => item[keyName] === value)
}

/**
 * 배열속 객체를 찾는기능
 * @param {array} arr
 * @param {string|number} keyName
 * @param {string|number|boolean} value
 * @return {object}
 */
export function findObjectByValue(arr, keyName, value)
{
  return arr.find(obj => obj[keyName] === value)
}
