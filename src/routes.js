import { wrap } from 'svelte-spa-router/wrap'
import NotFound from './pages/not-found.svelte'

const routes = {

  // assets
  '/': wrap({
    asyncComponent: () => import('./pages/assets/index.svelte'),
  }),
  '/asset/:id': wrap({
    asyncComponent: () => import('./pages/assets/detail.svelte'),
  }),
  '/asset/post': wrap({
    asyncComponent: () => import('./pages/assets/post.svelte'),
  }),
  '/asset/edit/:id': wrap({
    asyncComponent: () => import('./pages/assets/edit.svelte'),
  }),

  // collections
  '/collections': wrap({
    asyncComponent: () => import('./pages/collections/index.svelte'),
  }),
  '/collection/:id': wrap({
    asyncComponent: () => import('./pages/collections/detail.svelte'),
  }),
  '/collection/post': wrap({
    asyncComponent: () => import('./pages/collections/post.svelte'),
  }),
  '/collection/edit/:id': wrap({
    asyncComponent: () => import('./pages/collections/edit.svelte'),
  }),

  // about
  '/about': wrap({
    asyncComponent: () => import('./pages/about/index.svelte'),
  }),

  // 404
  '*': NotFound,

}

export default routes
