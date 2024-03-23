import Main from './main.svelte'

console.log('app main')

window.app = new Main({
  target: document.getElementById('app'),
})
