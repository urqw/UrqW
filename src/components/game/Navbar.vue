<template>
  <nav class="navbar is-light" role="navigation" aria-label="dropdown navigation">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item" :to="{name: 'home'}">
          <logo class="logo"></logo>
          <span>
            UrqW
          </span>
        </router-link>
        <a class="navbar-item">
          <span class="icon">
            <font-awesome-icon :icon="volume" />
          </span>
        </a>
        <a class="navbar-item">
          <span class="icon">
            <font-awesome-icon :icon="reload" />
          </span>
        </a>
        <a class="navbar-item">
          <span class="icon">
            <font-awesome-icon :icon="save" />
          </span>
        </a>
        <a class="navbar-item">
          <span class="icon">
            <font-awesome-icon :icon="load" />
          </span>
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item has-dropdown" @click="dropdownIsActive = !dropdownIsActive" :class="dropdownIsActive ? 'is-active' : ''">
            <a class="navbar-link">
              Right
            </a>

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
              <hr class="navbar-divider">
              <div class="navbar-item">
                Version 0.6.2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import FaVolumeOn from '@fortawesome/fontawesome-free-solid/faVolumeUp'
    import FaVolumeOff from '@fortawesome/fontawesome-free-solid/faVolumeOff'
    import FaReload from '@fortawesome/fontawesome-free-solid/faSyncAlt'
    import FaSave from '@fortawesome/fontawesome-free-solid/faSave'
    import FaLoad from '@fortawesome/fontawesome-free-solid/faFolderOpen'
    import Logo from '@/components/Logo'

    export default {
        name: 'navbar',
        data() {
            return {
                dropdownIsActive: false
            }
        },
        computed: {
            volume () {
                return FaVolumeOn
            },
            reload () {
                return FaReload
            },
            save () {
                return faSave
            },
            load () {
                return FaLoad
            },
        },

        components: {
            FontAwesomeIcon,
            Logo
        }
    }
</script>

<style scoped>
  .logo {
    width: 28px;
    height: 28px;
    margin-right: .7em;
  }

  .navbar.is-light .navbar-brand > .navbar-item,
  .navbar.is-light .navbar-brand .navbar-link {
    color: #4a4a4a;
  }
</style>