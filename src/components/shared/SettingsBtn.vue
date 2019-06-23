<template>
  <a class="navbar-item">
    <span class="icon">
      <font-awesome-icon :icon="FaCog" @click="open = !open" />
    </span>
    <SettingsPopup :open="open" @cancel="open = false"/>
  </a>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaCog from "@fortawesome/fontawesome-free-solid/faCog";
import SettingsPopup from "./SettingsPopup";

export default {
  name: "settings-btn",

  components: {
    SettingsPopup,
    FontAwesomeIcon,
  },

  data() {
    return {
      open: false,
      FaCog
    }
  }
};
</script>

<style scoped></style>
