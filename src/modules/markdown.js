import { marked, Renderer } from 'marked'

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
  renderer.heading = (op) => {
    const { text, depth } = op
    const id = text.replace(/\s+/g, '_')
    let str = `<h${depth} id="${id}">`
    str += `<a href="#${id}" class="anchor">${sharp}</a>`
    str += `${text}</h${depth}>`
    return str
  }
  renderer.image = (obj) => {
    const { href, title, text } = obj
    return `<img src="${href}" alt="${title || text}" loading="lazy"/>`
  }
  renderer.link = ({ href, title, text }) => {
    const _target = /^http/.test(href) ? ' target="_blank"' : ''
    const _title = title ? ` title="${title}"` : ''
    return `<a href="${href}"${_target}${_title}>${text}</a>`
  }
  return renderer
}

export function parseMarkdown(str)
{
  return marked.parse(str, {
    renderer: baseRenderer(),
  })
}
