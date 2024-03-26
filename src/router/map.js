const assets = [
  {
    path: '/',
    name: 'assets',
    component: () => import('../pages/assets/index.vue'),
    meta: {
      active: 'asset',
    },
  },
  {
    path: '/asset/:id',
    name: 'asset-detail',
    component: () => import('../pages/assets/detail.vue'),
    meta: {
      active: 'asset',
    },
  },
  {
    path: '/asset/create',
    name: 'asset-create',
    component: () => import('../pages/assets/create.vue'),
    meta: {
      active: 'asset',
    },
  },
  {
    path: '/asset/edit/:id',
    name: 'asset-edit',
    component: () => import('../pages/assets/edit.vue'),
    meta: {
      active: 'asset',
    },
  },
]

const collections = [
  {
    path: '/collections',
    name: 'collections',
    component: () => import('../pages/collections/index.vue'),
    meta: {
      active: 'collection',
    },
  },
  {
    path: '/collection/:id',
    name: 'collection-detail',
    component: () => import('../pages/collections/detail.vue'),
    meta: {
      active: 'collection',
    },
  },
  {
    path: '/collection/create',
    name: 'collection-create',
    component: () => import('../pages/collections/create.vue'),
    meta: {
      active: 'collection',
    },
  },
  {
    path: '/collection/edit/:id',
    name: 'collection-edit',
    component: () => import('../pages/collections/edit.vue'),
    meta: {
      active: 'collection',
    },
  },
]

const about = [
  {
    path: '/about',
    name: 'about',
    component: () => import('../pages/about/index.vue'),
    meta: {
      active: 'about',
    },
  },
]

const auth = [
  {
    path: '/login',
    name: 'login',
  },
]

export default [
  ...assets,
  ...collections,
  ...about,
  ...auth,
  //
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/error/404.vue'),
    meta: { layout: 'blank', active: 'service' },
  },
]
