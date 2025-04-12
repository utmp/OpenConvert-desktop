import { createRouter,createWebHashHistory } from "vue-router";
import Upload from "../src/components/Upload.vue";
const routes = [
    {
        path: '/',
        name: 'home',
        component: Upload
    },
    {
        path:'/categories',
        name: 'categories',
        component: () => import('../src/components/Categories.vue')
    },
    {
        path: '/plugins',
        name: 'plugins',
        component: () => import('../src/components/Plugins.vue')
    },
    {
        path: '/history',
        name: 'history',
        component: () => import('../src/components/History.vue')
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../src/components/Settings.vue')
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router;