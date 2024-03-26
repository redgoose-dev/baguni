import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './app.vue'

import './assets/scss/main.scss'

// set pinia
const pinia = createPinia()

// set app component
const app = createApp(App, {})
  .use(router)
  .use(pinia)
  .mount('#app')

export default app
