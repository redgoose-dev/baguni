export function success({ res, message, data })
{
  res
    .status(200)
    .json({
      message,
      data,
    })
}

export function error({ res, message })
{
  res
    .status(500)
    .json({
      message: message || '알 수 없는 오류',
    })
}
