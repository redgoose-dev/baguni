import { toast } from '../modules/toast/index.js'

const { DEV } = import.meta.env

/**
 * error
 * @param {string} message
 * @param {Error} error
 * @param {Boolean} useToast
 */
export function error(message, error, useToast = true)
{
  if (!message) return
  if (useToast) toast.add(message, 'error')
  if (DEV) console.error(error)
}

/**
 * success
 * @param {string} message
 */
export function success(message)
{
  if (message)
  {
    toast.add(message, 'success')
  }
}
