import ipware from 'ipware'
import { dateFormat } from '../libs/dates.js'
import { loggerSuccess, loggerError } from '../libs/logger.js'

const ipWareInstance = ipware()

/**
 * 응답 성공
 * @param {any} req
 * @param {any} res
 * @param {object} options
 */
export function success(req, res, options = {})
{
  const { code, message } = options
  res.runTime.stop()
  writeLog(req, res, 'success', {
    status: code || 200,
    message,
  })
  res
    .status(options.code || 200)
    .json({
      ...options,
      code: undefined,
      time: dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'),
      runTime: res.runTime.result(),
    })
}

/**
 * 응답 오류
 * @param {any} req
 * @param {any} res
 * @param {object} options
 */
export function error(req, res, options = {})
{
  const { message, code, _file, _err } = options
  res.runTime.stop()
  writeLog(req, res, 'error', {
    status: code || 500,
    message: _err?.message || message,
    ...(_file ? { file: _file } : {}),
  })
  res
    .status(code || 500)
    .json({
      message: message || '알 수 없는 오류',
      time: dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'),
      runTime: res.runTime.result(),
    })
}

/**
 * 오류처리하고 바로 종료한다.
 * @param {any} req
 * @param {any} res
 * @param {'success'|'error'} type
 * @param {object} options
 */
export function end(req, res, type = 'error', options = {})
{
  const { message, code, _file, _err } = options
  res.runTime.stop()
  writeLog(req, res, type, {
    status: code || 500,
    message: _err?._message || message,
    ...(_file ? { file: _file } : {}),
  })
  res.status(code || 500).end()
}

/**
 * 파일 다운로드 처리
 */
export function download(req, res, options = {})
{
  const { path, name, _message } = options
  res.runTime.stop()
  writeLog(req, res, 'success', {
    status: 200,
    message: _message,
  })
  res.download(path, name)
}

/**
 * 파일 열기
 */
export function outFile(req, res, options = {})
{
  const { type, buffer, _message } = options
  res.runTime.stop()
  writeLog(req, res, 'success', {
    status: 200,
    message: _message,
  })
  res.writeHead(200, { 'Content-Type': type })
  res.end(buffer)
}

/**
 * write log
 * @param {any} req
 * @param {any} res
 * @param {'success'|'error'} type
 * @param {object} op
 */
export function writeLog(req, res, type, op = {})
{
  const { message, ...rest } = op
  switch (type)
  {
    case 'success':
      loggerSuccess.log(type, message, {
        ...defaultLoggerOptions(req, res),
        ...rest,
      })
      break
    case 'error':
      loggerError.log(type, message, {
        ...defaultLoggerOptions(req, res),
        ...rest,
      })
      break
  }
}

function defaultLoggerOptions(req, res)
{
  const agent = req.headers['user-agent']
  return {
    ip: ipWareInstance.get_ip(req).clientIp,
    method: req.method,
    path: req.originalUrl,
    agent,
    runTime: res.runTime.result(),
  }
}
