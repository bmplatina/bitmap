import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// import HomeView from "../views/HomeView.vue";

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
        component: () => import("./views/GameEsdView.vue"),
    },
    {
        path: "/games/submit",
        name: "submit",
        component: () => import("./views/GameEsdSubmit.vue"),
    },
    {
        path: "/games/pending",
        name: "pending",
        component: () => import("./views/GameEsdPending.vue"),
    },
    {
        path: "/settings",
        name: "settings",
        component: () => import("./views/Settings.vue"),
    },
    {
        path: "/accounts",
        name: "accounts",
        component: () => import("./views/AccountSettings.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
