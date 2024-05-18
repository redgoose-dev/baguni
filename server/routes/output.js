import { dateFormat } from '../libs/dates.js'

/**
 * 응답 성공
 * @param {any} res
 * @param {object} options
 */
export function success(res, options = {})
{
  res
    .status(options.code || 200)
    .json({
      ...options,
      code: undefined,
      time: dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'),
    })
}

/**
 * 응답 오류
 * @param {any} res
 * @param {object} options
 */
export function error(res, options = {})
{
  const { message, code } = options
  res
    .status(code || 500)
    .json({
      ...options,
      code: undefined,
      message: message || '알 수 없는 오류',
      time: dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'),
    })
}
