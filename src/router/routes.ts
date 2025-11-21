import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
     beforeEnter: (to, from, next) => {
      const userStore =  sessionStorage.getItem("userId");
      if (!userStore) {
        next({ path: '/login' });
      } else {
        next();
      }
    },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],

  },
 {
  path: '/login',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    { path: '', component: () => import('pages/login.vue') }
  ]
},

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
