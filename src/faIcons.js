import Vue from "vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { faArrowAltCircleLeft } from "@fortawesome/free-solid-svg-icons/faArrowAltCircleLeft";
import { faVolumeUp } from "@fortawesome/free-solid-svg-icons/faVolumeUp";
import { faVolumeDown } from "@fortawesome/free-solid-svg-icons/faVolumeDown";
import { faVolumeMute } from "@fortawesome/free-solid-svg-icons/faVolumeMute";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons/faFolderOpen";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faUpload } from "@fortawesome/free-solid-svg-icons/faUpload";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";

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
  faDownload
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
