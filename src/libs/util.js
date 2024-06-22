import { marked } from 'marked'
import imageResize from 'image-resize'

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

/**
 * 파일을 클립보드로 복사한다.
 * @param {string} src
 * @param {object} meta
 * @param {string} [meta.type]
 * @param {number} [meta.width]
 * @return {Promise<void>}
 */
export async function copyClipboardFile(src, meta = {})
{
  let blob
  let { type, width } = meta
  const res = await fetch(src)
  if ([ 'image/webp', 'image/jpeg', 'image/gif' ].includes(type))
  {
    blob = await res.blob()
    blob = await imageResize(blob, {
      width: width || 900,
      outputType: 'blob',
      format: 'png'
    })
    type = 'image/png'
  }
  else if (/^(image|text)/.test(type))
  {
    blob = await res.blob()
  }
  if (blob)
  {
    const data = [
      new ClipboardItem({ [type]: blob })
    ]
    await navigator.clipboard.write(data)
  }
  else
  {
    throw new Error('클립보드에 복사할 수 없습니다.')
  }
}

/**
 * 메타 엘리먼트를 만든다.
 * @param {object} options
 * @return {HTMLMetaElement}
 */
export function createMeta(options = {})
{
  const { name, property, content } = options
  const meta = document.createElement('meta')
  if (name) meta.name = name
  if (property) meta.setAttribute('property', property)
  if (content) meta.setAttribute('content', content)
  return meta
}

/**
 * markdown to text
 * @param {string} src
 * @param {boolean} useLine
 * @return {string}
 */
export function markdownToText(src, useLine = true)
{
  const html = marked(src)
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  let text = tempDiv.textContent || tempDiv.innerText || ''
  if (!useLine)
  {
    text = text.replace(/\n/gi, ' ')
    text = text.trim()
  }
  return text
}
