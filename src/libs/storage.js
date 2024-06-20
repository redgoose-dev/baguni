const prefix = 'baguni'

export const STORAGE_KEYS = {
  ASSETS_FILTER: 'assets-filter',
}

/**
 * set storage data
 * @param {string} key
 * @param {object|array} value
 */
export function setStorage(key, value)
{
  window.localStorage.setItem(`${prefix}-${key}`, JSON.stringify(value))
}

/**
 * get storage data
 * @param {string} key
 * @return {object|array}
 */
export function getStorage(key)
{
  try
  {
    const text = window.localStorage.getItem(`${prefix}-${key}`)
    return JSON.parse(text)
  }
  catch (e)
  {
    return undefined
  }
}
