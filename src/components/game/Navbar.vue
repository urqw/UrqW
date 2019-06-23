<template>
  <nav
    class="navbar is-light"
    role="navigation"
    aria-label="dropdown navigation"
  >
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" @click="clickBtn('home')">
          <Logo class="logo" />
          <span>UrqW</span>
        </a>
        <SettingsBtn/>
        <a class="navbar-item">
          <span class="icon">
            <font-awesome-icon
              :icon="FaVolumeOn"
              @click="clickBtn('switchVolume')"
            />
          </span>
        </a>
        <a class="navbar-item" @click="clickBtn('restartGame')">
          <span class="icon">
            <font-awesome-icon :icon="FaReload" />
          </span>
        </a>
        <a
          :class="{ 'is-active': page === 'save' }"
          class="navbar-item"
          @click="clickBtn(page === 'save' ? 'returnToGame' : 'saveGame')"
        >
          <span class="icon">
            <font-awesome-icon :icon="FaSave" />
          </span>
        </a>
        <a
          :class="{ 'is-active': page === 'load' }"
          class="navbar-item"
          @click="clickBtn(page === 'load' ? 'returnToGame' : 'loadGame')"
        >
          <span class="icon">
            <font-awesome-icon :icon="FaLoad" />
          </span>
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end">
          <div
            class="navbar-item has-dropdown"
            @click="dropdownIsActive = !dropdownIsActive"
            :class="{ 'is-active': dropdownIsActive }"
          >
            <a class="navbar-link" v-text="$t('inventory')"></a>
            <div class="navbar-dropdown is-right">
              <a class="navbar-item">
                Overview
              </a>
              <a class="navbar-item">
                Elements
              </a>
              <a class="navbar-item">
                Components
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaVolumeOn from "@fortawesome/fontawesome-free-solid/faVolumeUp";
import FaReload from "@fortawesome/fontawesome-free-solid/faSyncAlt";
import FaSave from "@fortawesome/fontawesome-free-solid/faSave";
import FaLoad from "@fortawesome/fontawesome-free-solid/faFolderOpen";
import Logo from "@/components/Logo";
import SettingsBtn from "@/components/shared/SettingsBtn";

export default {
  name: "navbar",
  data() {
    return {
      dropdownIsActive: false,
      FaVolumeOn,
      FaReload,
      FaSave,
      FaLoad
    };
  },

  components: {
    SettingsBtn,
    FontAwesomeIcon,
    Logo
  },

  methods: {
    clickBtn(name) {
      this.$emit("clickBtn", name);
    }
  },
  props: {
    page: String
  }
};
</script>

<style scoped>
.logo {
  width: 28px;
  height: 28px;
  margin-right: 0.7em;
}

.navbar.is-light .navbar-brand > .navbar-item,
.navbar.is-light .navbar-brand .navbar-link {
  color: #4a4a4a;
}
</style>
