import Vue from "vue";
import VueMeta from "vue-meta";
import { VueHammer } from "vue2-hammer";
import App from "./App.vue";
import router from "./router";
import {i18n} from "./i18n";
import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faArrowAltCircleLeft,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faSync,
  faSave,
  faFolderOpen,
  faCog,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import "./registerServiceWorker";

Vue.config.productionTip = false;

library.add(
  faArrowAltCircleLeft,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faSync,
  faSave,
  faFolderOpen,
  faCog,
  faUpload,
);

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(VueHammer);

Vue.use(VueMeta);

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
