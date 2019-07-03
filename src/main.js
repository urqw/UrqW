import Vue from "vue";
import VueMeta from "vue-meta";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import "./faIcons";
import "./registerServiceWorker";

Vue.config.productionTip = false;

Vue.use(VueMeta);

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
