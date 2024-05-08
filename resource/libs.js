export function message(type, msg)
{
  switch (type)
  {
    case 'error':
      console.error('[ERROR]', msg)
      break
    default:
      console.log(msg)
      break
  }
}
