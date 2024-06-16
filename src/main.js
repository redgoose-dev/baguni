import { createApp } from 'vue'
import { createPinia } from 'pinia'
import setupModules from './modules/setup.js'
import router from './router/index.js'

import App from './app.vue'

// load stylesheet
import './assets/scss/main.scss'

// set pinia
const pinia = createPinia()

// setup modules
setupModules()

// set app component
const app = createApp(App, {})
  .use(router)
  .use(pinia)
  .mount('#app')

export default app
