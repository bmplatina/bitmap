import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// import HomeView from "../views/HomeView.vue";
import GameEsd from "./views/GameEsdView.vue";
import GameEsdSubmit from "./views/GameEsdSubmit.vue";
import GameEsdPending from "./views/GameEsdPending.vue";

const routes: Array<RouteRecordRaw> = [
    // {
    //     path: "/",
    //     name: "home",
    //     component: HomeView,
    // },
    // {
    //     path: "/about",
    //     name: "about",
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () =>
    //         import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
    // },
    {
        path: "/games",
        name: "games",
        component: GameEsd,
    },
    {
        path: "/games/submit",
        name: "submit",
        component: GameEsdSubmit,
    },
    {
        path: "/games/pending",
        name: "pending",
        component: GameEsdPending,
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
