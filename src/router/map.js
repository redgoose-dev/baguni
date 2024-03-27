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
    component: () => import('../pages/auth/login.vue'),
    meta: {
      active: 'auth',
      layout: 'blank',
    },
  },
]

const guide = [
  {
    path: '/guide',
    name: 'guide',
    component: () => import('../pages/guide/index.vue'),
    meta: {
      active: 'guide',
    },
    children: [
      {
        path: 'forms/input-text',
        name: 'guide-forms-input-text',
        component: () => import('../pages/guide/forms/input-text.vue'),
      },
      {
        path: 'forms/select',
        name: 'guide-forms-select',
        component: () => import('../pages/guide/forms/select.vue'),
      },
      {
        path: 'forms/checkbox-and-radio',
        name: 'guide-forms-checkbox-and-radio',
        component: () => import('../pages/guide/forms/checkbox-and-radio.vue'),
      },
      {
        path: 'forms/switch',
        name: 'guide-forms-switch',
        component: () => import('../pages/guide/forms/switch.vue'),
      },
      {
        path: 'forms/tag',
        name: 'guide-forms-tag',
        component: () => import('../pages/guide/forms/tag.vue'),
      },
      {
        path: 'navigation/button',
        name: 'guide-navigation-button',
        component: () => import('../pages/guide/navigation/button.vue'),
      },
      {
        path: 'asset/colors',
        name: 'guide-asset-colors',
        component: () => import('../pages/guide/asset/colors.vue'),
      },
      {
        path: 'asset/icons',
        name: 'guide-asset-icons',
        component: () => import('../pages/guide/asset/icons.vue'),
      },
    ],
  },
]

export default [
  ...assets,
  ...collections,
  ...about,
  ...auth,
  ...guide,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/error/404.vue'),
    meta: { layout: 'blank', active: 'service' },
  },
]
