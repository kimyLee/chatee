import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import GPTWeb from '@/components/GPTWeb.vue'
import gptRole from '@/components/gpt-role.vue'

const routes: Array<RouteRecordRaw> = [
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home,
  // },
  {
    path: '/web', // 蓄客页面
    name: 'GPTWeb',
    component: GPTWeb,
  },
  {
    path: '/20130318chatee_beta_test_console_page', // 调试页面
    name: 'gpt-role',
    component: gptRole,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
