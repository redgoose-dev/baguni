import { marked, Renderer } from 'marked'
import { authStore } from '../store/index.js'
import { assetContentBody } from '../libs/consts.js'

const sharp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`

export function markedSetup()
{
  marked.setOptions({
    gfm: true,
    breaks: true,
    silent: true,
  })
}

export function baseRenderer(renderer = null)
{
  if (!renderer) renderer = new Renderer()
  renderer.heading = (ctx) => {
    const { depth, text, tokens } = ctx
    const id = text.replace(/\s+/g, '_')
    const _text = renderer.parser.parseInline(tokens)
    let str = `<h${depth} id="${id}">`
    str += `<a href="#${id}" class="anchor">${sharp}</a>`
    str += `${_text}</h${depth}>`
    return str
  }
  renderer.image = (ctx) => {
    const { href, title, text } = ctx
    return `<img src="${href}" alt="${title || text}" loading="lazy"/>`
  }
  renderer.link = (ctx) => {
    const { href, title, text, tokens } = ctx
    const _target = /^http/.test(href) ? ' target="_blank"' : ''
    const _title = title ? ` title="${title}"` : ''
    const _text = renderer.parser.parseInline(tokens)
    return `<a href="${href}"${_target}${_title}>${_text}</a>`
  }
  return renderer
}

export function parseMarkdown(str, isPrivate)
{
  if (!str) return ''
  if (isPrivate)
  {
    const auth = authStore()
    str = str.replace(assetContentBody.hostLine, `$1?_a=${auth.token}`)
  }
  str = str.replaceAll(assetContentBody.host, '')
  return marked.parse(str, {
    renderer: baseRenderer(),
  })
}
