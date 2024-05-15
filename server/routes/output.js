export function success({ res, message, data })
{
  res
    .status(200)
    .json({
      message,
      data,
    })
}

export function error({ res, message, code })
{
  res
    .status(code || 500)
    .json({
      code: code || 500,
      message: message || '알 수 없는 오류',
    })
}
