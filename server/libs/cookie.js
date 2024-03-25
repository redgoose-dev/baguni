export let cookieUnits

const { VITE_COOKIE_PREFIX, VITE_COOKIE_EXPIRY_DAY, VITE_COOKIE_HTTPONLY, VITE_COOKIE_PATH, VITE_COOKIE_DOMAIN } = import.meta.env

export function cookieSetup(options)
{
  cookieUnits = {
    prefix: VITE_COOKIE_PREFIX,
    options: {
      maxAge: 1000 * 60 * 60 * 24 * Number(VITE_COOKIE_EXPIRY_DAY), // days
      httpOnly: (VITE_COOKIE_HTTPONLY === 'true'),
      path: VITE_COOKIE_PATH || '/',
      domain: VITE_COOKIE_DOMAIN || undefined,
      ...options,
    },
  }
}
