import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setup as toastSetup } from './modules/toast/index.js'
import router from './router/index.js'
import { markedSetup } from './modules/markdown.js'
import App from './app.vue'

// load stylesheet
import './assets/scss/main.scss'

// set pinia
const pinia = createPinia()

// set modules
toastSetup({
  delay: 5000,
})

// setup marked
markedSetup()

// set app component
const app = createApp(App, {})
  .use(router)
  .use(pinia)
  .mount('#app')

export default app
