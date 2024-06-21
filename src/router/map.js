const { DEV } = import.meta.env

const assets = [
  {
    path: '/',
    name: 'assets',
    component: () => import('../pages/assets/index.vue'),
    meta: {
      active: 'asset',
      layout: 'default',
    },
  },
  {
    path: '/asset/create',
    name: 'asset-create',
    component: () => import('../pages/assets/create.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/asset/:id/edit',
    name: 'asset-edit',
    component: () => import('../pages/assets/edit.vue'),
    meta: {
      active: 'asset',
      layout: 'default',
    },
  },
  {
    path: '/asset/:id',
    name: 'asset-detail',
    component: () => import('../pages/assets/detail.vue'),
    meta: {
      active: 'asset',
      layout: 'default',
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
      layout: 'default',
    },
  },
  {
    path: '/collection/:id',
    name: 'collection-detail',
    component: () => import('../pages/collections/detail.vue'),
    meta: {
      active: 'collection',
      layout: 'default',
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
      layout: 'default',
    },
  },
]

const users = [
  {
    path: '/user/account/',
    name: 'user-account',
    component: () => import('../pages/users/account.vue'),
    meta: {
      active: 'user',
      layout: 'default',
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

const guide = DEV ? [
  {
    path: '/guide',
    name: 'guide',
    component: () => import('../pages/guide/index.vue'),
    meta: {
      active: 'guide',
      layout: 'default',
    },
    children: [
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
      {
        path: 'asset/loading',
        name: 'guide-asset-loading',
        component: () => import('../pages/guide/asset/loading.vue'),
      },
      {
        path: 'content/modal',
        name: 'guide-content-modal',
        component: () => import('../pages/guide/content/modal.vue'),
      },
      {
        path: 'content/image',
        name: 'guide-content-image',
        component: () => import('../pages/guide/content/image.vue'),
      },
      {
        path: 'content/lightbox',
        name: 'guide-content-lightbox',
        component: () => import('../pages/guide/content/lightbox.vue'),
      },
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
        path: 'forms/etc',
        name: 'guide-forms-etc',
        component: () => import('../pages/guide/forms/etc.vue'),
      },
      {
        path: 'navigation/button',
        name: 'guide-navigation-button',
        component: () => import('../pages/guide/navigation/button.vue'),
      },
      {
        path: 'navigation/context',
        name: 'guide-navigation-context',
        component: () => import('../pages/guide/navigation/context.vue'),
      },
      {
        path: 'navigation/paginate',
        name: 'guide-navigation-paginate',
        component: () => import('../pages/guide/navigation/paginate.vue'),
      },
    ],
  },
] : undefined

export default [
  ...assets,
  ...collections,
  ...about,
  ...users,
  ...auth,
  ...(guide ? guide : []),
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/error/404.vue'),
    meta: { layout: 'blank', active: 'service' },
  },
]
