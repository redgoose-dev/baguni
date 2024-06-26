import { sleep } from '../../libs/util.js'
import './index.scss'

const defaultOptions = {
  message: 'toast message',
  speed: 300,
  delay: 3000,
  color: '', // success,error
  max: 5,
}
export let toast

/**
 * Toast class
 */
class Toast {

  constructor(options)
  {
    // set member values
    this.options = mergeOptions(defaultOptions, options)
    this.elementClassName = 'rg-toast'
    this.index = {}
    this.key = 0
    // check container element
    if (document.querySelector(`.${this.elementClassName}`)) return
    // set elements
    this.$container = document.createElement('div')
    this.$index = document.createElement('ul')
    this.$container.classList.add(this.elementClassName)
    this.$container.appendChild(this.$index)
    // append dom
    document.body.appendChild(this.$container)
  }

  async add(src, color)
  {
    // set values
    if (typeof src === 'string') src = { message: src }
    if (color) src.color = color
    const op = mergeOptions(this.options, src)
    // set element
    let $li = htmlToElement(`<li class="rg-toast__item">` +
      `<div class="rg-toast__item-body">` +
      `<span class="rg-toast__message">${op.message}</span>` +
      `</div>` +
      `<i class="rg-toast__progress"></i>` +
      `</li>`)
    // set data
    $li.dataset.key = this.key
    $li.dataset.speed = op.speed
    $li.dataset.delay = op.delay
    // set color
    if (op.color) $li.classList.add(op.color)
    // set event
    $li.addEventListener('click', e => {
      this.remove(Number(e.currentTarget.dataset.key))
    })
    // push item
    this.index[this.key] = {
      el: $li,
      message: op.message,
      speed: op.speed,
      delay: op.delay,
      color: op.color,
    }
    // update key for next toast
    this.key += 1
    // append content
    this.$index.insertBefore($li, this.$index.firstChild)
    // toast 갯수가 특정갯수가 넘어가면 오래된것부터 삭제한다.
    if ((this.options.max || 0) < Object.keys(this.index).length)
    {
      let removeItems = Object.keys(this.index)
        .reverse()
        .slice(this.options.max, Object.keys(this.index).length)
      removeItems.forEach((n) => this.remove(Number(n)))
    }
    // animation play
    await sleep(20)
    $li.style.transitionDuration = `${op.speed}ms`
    $li.classList.add('rg-toast__item-show')
    // check delay (`delay`값이 20보다 작으면 항상 떠있도록..)
    if ((op.delay || 0) < 20) return
    // transition end
    let e = await transitionEnd($li, '')
    // set progress
    let progress = e.target.querySelector('.rg-toast__progress')
    progress.style.animationDuration = `${e.target.dataset.delay}ms`
    progress.classList.add('play')
    e = await transitionEnd(progress, 'animation')
    // remove toast
    this.remove(Number(e.target.parentNode.dataset.key)).then()
  }

  async remove(key)
  {
    // check
    if (!this.index[key]) return
    // set values
    let el = this.index[key].el
    let speed = this.index[key].speed
    // remove item from index
    delete this.index[key]
    // close animation
    el.style.transitionDuration = `${speed}ms`
    el.classList.remove('rg-toast__item-show')
    // transition end
    const e = await transitionEnd(el, '')
    // remove element
    this.$index.removeChild(e.target)
  }

}

function transitionEnd(dom, type)
{
  return new Promise(resolve => {
    if (!dom) return
    let event = { base: '', webkit: '' }
    switch (type)
    {
      case 'animation':
        event.base = 'animationend'
        event.webkit = 'webkitAnimationEnd'
        break
      default:
        event.base = 'transitionend'
        event.webkit = 'webkitTransitionEnd'
        break
    }
    function callback(e)
    {
      dom.removeEventListener(event.base, callback)
      dom.removeEventListener(event.webkit, callback)
      resolve(e)
    }
    dom.addEventListener(event.base, callback)
    dom.addEventListener(event.webkit, callback)
  })
}

function mergeOptions(options, newOptions)
{
  return {
    ...options,
    message: newOptions?.message || options?.message,
    color: newOptions?.color || options?.color,
    speed: newOptions?.speed || options?.speed || 100,
    delay: newOptions?.delay || options?.delay,
  }
}

/**
 * convert html string to element
 * https://stackoverflow.com/a/494348
 */
export function htmlToElement(str)
{
  let div = document.createElement('div')
  div.innerHTML = str.trim()
  return div.children[0]
}

/**
 * setup toast
 * @param {object} options
 */
export function setup(options = { message: '' })
{
  toast = new Toast(options)
}
