import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/json2javabean',
    name: 'Json2JavaBean',
    component: () => import('../views/Json2JavaBean.vue')
  },
  {
    path: '/json2jsonschema',
    name: 'Json2Jsonschema',
    component: () => import('../views/Json2Jsonschema.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/',
    name: '/',
    redirect: 'Home',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
