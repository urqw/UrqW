<template>
  <div>
    <nav class="navbar is-light">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" @click="clickBtn('home')">
            <Logo class="logo" />
            <span>UrqW</span>
          </a>
        </div>
        <div class="navbar-menu">
          <div class="navbar-start">
            <NavbarItem
              :icon="volumeIcon"
              @click.native="clickBtn('switchVolume')"
            />
            <NavbarItem icon="sync" @click.native="clickBtn('restartGame')" />
            <NavbarItem
              icon="save"
              :title="$t('saveGame')"
              :class="{ 'is-active': page === 'save' }"
              @click.native="clickBtn(page === 'save' ? 'returnToGame' : 'saveGame')"
            />
            <NavbarItem
              icon="folder-open"
              :title="$t('loadGame')"
              :class="{ 'is-active': page === 'load' }"
              @click.native="clickBtn(page === 'load' ? 'returnToGame' : 'loadGame')"
            />
          </div>
          <div class="navbar-end">
            <a
              class="navbar-item"
              @click="isOpenedSettings = !isOpenedSettings"
            >
              <span class="icon">
                <font-awesome-icon icon="cog" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
    <SettingsPopup
      :open="isOpenedSettings"
      @cancel="isOpenedSettings = false"
    />
  </div>
</template>

<script>
import Logo from "@/components/Logo";
import SettingsPopup from "@/components/shared/SettingsPopup.vue";

import { VOLUMES } from "@/const.js";
import NavbarItem from "../shared/NavbarItem.vue";

export default {
  name: "navbar",
  props: {
    Client: Object,
    page: String
  },
  data() {
    return {
      isOpenedSettings: false,
      dropdownIsActive: false
    };
  },
  computed: {
    volumeIcon() {
      if (!this.Client) {
        return "volume-up";
      }
      const volumeIndex = VOLUMES.findIndex(
        volume => volume === this.Client.getVolume()
      );

      if (volumeIndex === -1) {
        return "volume-up";
      }

      return ["volume-up", "volume-down", "volume-mute"][volumeIndex];
    }
  },
  components: {
    NavbarItem,
    SettingsPopup,
    Logo
  },

  methods: {
    clickBtn(name) {
      this.$emit("clickBtn", name);
    }
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

.navbar > .container {
  display: flex;
}

.navbar-menu {
  display: flex;
  align-items: stretch;
  flex-grow: 1;
  flex-shrink: 0;
  box-shadow: none;
  background-color: whitesmoke;
  color: #363636;
}

.navbar-start,
.navbar-end {
  display: flex;
}

.navbar-end {
  margin-left: auto;
}
</style>
