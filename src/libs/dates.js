import { twoDigit } from './strings.js'

/**
 * convert date format
 * format guide: `{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}`
 */
export function dateFormat(date, format)
{
  let mix = format.replace(/\{yyyy\}/, String(date.getFullYear()))
  mix = mix.replace(/\{MM\}/, twoDigit(date.getMonth() + 1))
  mix = mix.replace(/\{dd\}/, twoDigit(date.getDate()))
  mix = mix.replace(/\{hh\}/, twoDigit(date.getHours()))
  mix = mix.replace(/\{mm\}/, twoDigit(date.getMinutes()))
  mix = mix.replace(/\{ss\}/, twoDigit(date.getSeconds()))
  return mix
}

/**
 * API 요청을 위하여 날짜 범위값을 조정한다.
 * @param {string} start
 * @param {string} end
 * @return {object|undefined}
 */
export function getDateRangeForQuery(start, end)
{
  if (start && end)
  {
    const timeStart = new Date(start).getTime()
    const timeEnd = new Date(end).getTime()
    if (timeStart > timeEnd)
    {
      return { date_start: start, date_end: end }
    }
    else
    {
      return undefined
    }
  }
  else if (start)
  {
    return { date_start: start, date_end: start }
  }
  else if (end)
  {
    return { date_start: end, date_end: end }
  }
  else
  {
    return undefined
  }
}
