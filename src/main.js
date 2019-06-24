import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import {i18n} from "./i18n";
import {library} from '@fortawesome/fontawesome-svg-core'
import { faArrowAltCircleLeft } from "@fortawesome/free-solid-svg-icons/faArrowAltCircleLeft";
import { faVolumeUp } from "@fortawesome/free-solid-svg-icons/faVolumeUp";
import { faVolumeDown } from "@fortawesome/free-solid-svg-icons/faVolumeDown";
import { faVolumeMute } from "@fortawesome/free-solid-svg-icons/faVolumeMute";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons/faFolderOpen";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faUpload } from "@fortawesome/free-solid-svg-icons/faUpload";
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

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");
