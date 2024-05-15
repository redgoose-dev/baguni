
/**
 * create error
 * @param {string} message
 * @param {number} code
 * @return {Error}
 */
export function createError(message = 'An unknown error has occurred.', code = 500)
{
  const error = new Error(message)
  error.code = code
  return error
}
