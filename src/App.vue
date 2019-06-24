<template>
  <div id="app">
    <div class="main">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Footer from "@/components/Footer.vue";
// import Parser from "@/engine/src/Parser";
//console.log(Parser);

export default {
  name: "home",
  components: {
    Footer,
  },
  mounted() {
    //    console.log(Parser);
  }
};
</script>

<style lang="sass">
@import "~bulma/sass/utilities/initial-variables.sass";

$fullhd: $desktop;
$widescreen: $desktop;

@import "~bulma/bulma.sass";

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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
