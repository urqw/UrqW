<template>
  <div class="section">
    <div class="container">
      <Logo />

      <Message :msg="message" v-if="message" />

      <LoadGame />

      <GameList />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Message from "@/components/home/Message.vue";
import Logo from "@/components/home/Logo.vue";
import LoadGame from "@/components/home/LoadGame.vue";
import GameList from "@/components/home/GameList.vue";

export default {
  name: "home",
  components: {
    Message,
    Logo,
    LoadGame,
    GameList
  },
  computed: {
    /*   content: function () {
                     return (this.Game.Client && this.Game.Client.text) ? this.Game.Client.text : []
                 },  */
  },
  data() {
    return {
      message: "Loading..."
    };
  },
  mounted() {
    this.message = false;
  }
};

// редирект с хеша
</script>
