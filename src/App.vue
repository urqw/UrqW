<template>
  <div id="app">
    <div class="main">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "home",
};
</script>

<style lang="sass">
@import "~bulma/sass/utilities/initial-variables.sass";

$fullhd: $desktop;
$widescreen: $desktop;

@import "~bulma/bulma.sass";
@import "~bulma-quickview/src/sass/index.sass";

/*@import "assets/css/style.css";*/
</style>

<style scoped>
/**
   * footer
   */
#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 100%;
}
</style>
