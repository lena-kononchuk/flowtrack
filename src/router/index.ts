import { createRouter, createWebHistory } from 'vue-router'
import ProjectsList from '@/views/ProjectsList.vue'
import ProjectDetail from '@/views/ProjectDetail.vue'

const router = createRouter({
  history: createWebHistory('/FlowBoard-New/'),
  routes: [
    {
      path: '/',
      name: 'projects',
      component: ProjectsList
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: ProjectDetail
    }
  ]
})

export default router
