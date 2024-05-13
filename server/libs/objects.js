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
