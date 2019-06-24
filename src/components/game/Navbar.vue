<template>
    <div>
        <nav class="navbar is-light">
            <div class="container">
                <div class="navbar-brand">
                    <a class="navbar-item" @click="clickBtn('home')">
                        <Logo class="logo"/>
                        <span>UrqW</span>
                    </a>
                </div>
                <div class="navbar-menu">
                    <div class="navbar-start">
                        <a class="navbar-item" @click="clickBtn('switchVolume')">
                            <span class="icon">
                                <font-awesome-icon
                                    :icon="volumeIcon"
                                />
                            </span>
                        </a>
                        <a class="navbar-item" @click="clickBtn('restartGame')">
                        <span class="icon">
                          <font-awesome-icon icon="sync" />
                        </span>
                        </a>
                        <a :class="{ 'is-active': page === 'save' }"
                           class="navbar-item"
                           @click="clickBtn(page === 'save' ? 'returnToGame' : 'saveGame')"
                        >
                      <span class="icon">
                        <font-awesome-icon icon="save" />
                      </span>
                        </a>
                        <a :class="{ 'is-active': page === 'load' }"
                           class="navbar-item"
                           @click="clickBtn(page === 'load' ? 'returnToGame' : 'loadGame')"
                        >
                      <span class="icon">
                        <font-awesome-icon icon="folder-open" />
                      </span>
                        </a>
                    </div>
                    <div class="navbar-end">
                        <a class="navbar-item" @click="isOpenedSettings = !isOpenedSettings">
                        <span class="icon">
                          <font-awesome-icon icon="cog"/>
                        </span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        <SettingsPopup :open="isOpenedSettings" @cancel="isOpenedSettings = false"/>
    </div>
</template>

<script>
import Logo from "@/components/Logo";
import SettingsPopup from "@/components/shared/SettingsPopup.vue";

import { VOLUMES } from "@/const.js";

export default {
  name: "navbar",
  props: {
    Client: Object,
    page: String,
  },
  data() {
    return {
      isOpenedSettings: false,
      dropdownIsActive: false,
    };
  },
  computed: {
    volumeIcon() {
      if (!this.Client) {
        return 'volume-up';
      }

      return [
        'volume-up',
        'volume-down',
        'volume-mute',
      ][VOLUMES.findIndex(volume => volume === this.Client.volume)];
    },
  },
  components: {
    SettingsPopup,
    Logo
  },

  methods: {
    clickBtn(name) {
      this.$emit("clickBtn", name);
    }
  },
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
}

.navbar-start,
.navbar-end {
    display: flex;
}

.navbar-end {
    margin-left: auto;
}
</style>
