import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";

Vue.use(Vuex);

const urlParams = new URLSearchParams(window.location.search);
const monoApi = urlParams.get("monoApi");
const amisApi = urlParams.get("amisApi");

const store = new Vuex.Store({
  state: {
    isLoggedIn: false,
    user: null,
    monoApi: monoApi || "http://localhost:6102/",
    amisApi: amisApi || "http://localhost:6103/",
    documents: [],
  },
});

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
