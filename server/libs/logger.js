import { transports, createLogger, format, addColors } from 'winston'
import 'winston-daily-rotate-file'
import { dataPath } from './consts.js'
import { isDev } from './util.js'

const { combine, timestamp, printf, colorize, simple } = format

// setup
addColors({
  error: 'red',
  warning: 'yellow',
  success: 'green',
  info: 'gray',
})
const levels = {
  error: 0,
  success: 1,
}

// Exception
const transportException = new transports.DailyRotateFile({
  level: 'error',
  dirname: `${dataPath}/logs/exception`,
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
})

// success logger
export const loggerSuccess = createLogger({
  level: 'success',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    new transports.DailyRotateFile({
      dirname: `${dataPath}/logs/success`,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [
    transportException,
  ],
})

// error logger
export const loggerError = createLogger({
  level: 'error',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    new transports.DailyRotateFile({
      dirname: `${dataPath}/logs/error`,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    })
  ],
  exceptionHandlers: [
    transportException,
  ],
})

// for development
if (isDev)
{
  const consoleFormatForSuccess = printf(({ level, message, timestamp }) => {
    return `${level} [${timestamp}] ${message}`
  })
  loggerSuccess.add(new transports.Console({
    level: 'success',
    format: combine(
      timestamp({ format: 'HH:mm:ss' }),
      colorize(),
      simple(),
      consoleFormatForSuccess
    ),
  }))
  const consoleFormatForError = printf(({ level, message, timestamp, file }) => {
    let str = `${level} [${timestamp}] ${message}`
    if (file) str += `\n- File: ${file}`
    return str
  })
  loggerError.add(new transports.Console({
    level: 'error',
    format: combine(
      timestamp({ format: 'HH:mm:ss' }),
      colorize(),
      simple(),
      consoleFormatForError
    ),
  }))
}
