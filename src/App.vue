<template>
  <div id="app">
    <div class="main">
      <router-view/>
    </div>
    <Footer/>
  </div>
</template>

<script>
// @ is an alias to /src
import Footer from "@/components/Footer.vue";
import Parser from "@/engine/src/Parser";
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

<style>
@import "~bulma/css/bulma.css";
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
    flex: 1;
  }
</style>
