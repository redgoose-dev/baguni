/**
 * sleep (delay tool)
 */
export function sleep(ms = 1000)
{
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 디바운스 (연속된 함수호출 중 마지막 한번만 실행하는 툴)
 * @param {function} fn
 * @param {number} delay
 * @return {function}*/
export function debounce(fn, delay)
{
  let timeoutId = null
  return function()
  {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, arguments), delay)
  }
}

/**
 * 쓰로틀링 (정해진 시간동안 한번만 실행하는 툴)
 * @param {function} fn
 * @param {number} ms
 * @return {function}
 */
export function throttle(fn, ms)
{
  let waiting = false
  return function()
  {
    if (!waiting)
    {
      fn.call(this, arguments)
      waiting = true
      setTimeout(() => { waiting = false }, ms)
    }
  }
}
