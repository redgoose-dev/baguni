
export function home(req, res)
{
  res.json({
    message: 'Welcome to Baguni.',
  })
}

export function notFound(req, res)
{
  res.status(404).json({
    message: 'not found',
  })
}
