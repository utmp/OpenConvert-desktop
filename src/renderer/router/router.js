import { createRouter,createWebHashHistory } from "vue-router";
import Upload from "../src/components/Upload.vue";
const routes = [
    {
        path: '/',
        name: 'home',
        component: Upload
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
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router;