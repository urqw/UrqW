<template>
  <div class="section">
    <div class="container">
      <Logo />

      <Message :msg="message" v-if="message" />

      <UploadGame />

      <GameList />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Message from "@/components/home/Message.vue";
import Logo from "@/components/home/Logo.vue";
import UploadGame from "@/components/home/UploadGame.vue";
import GameList from "@/components/home/GameList.vue";

export default {
  name: "home",
  components: {
    Message,
    Logo,
    UploadGame,
    GameList
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
