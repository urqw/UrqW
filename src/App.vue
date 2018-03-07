<template>
  <div id="app" class="container">
    <router-view/>
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
</style>
