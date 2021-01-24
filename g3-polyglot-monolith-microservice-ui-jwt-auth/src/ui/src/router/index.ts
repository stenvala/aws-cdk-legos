import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Document from "../views/Document.vue";
import Documents from "../views/Documents.vue";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/documents",
    name: "Documents",
    component: Documents,
  },
  {
    path: "/document/:id",
    name: "Document",
    component: Document,
  },
  /**
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" * / "../views/About.vue"),
  },
  */
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
