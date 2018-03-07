<template>
  <div>
    <Logo/>

    <Message :msg="message" v-if="message"/>

    <button @click="clicked">Event2</button>

    <LoadGame/>

    <GameList/>
  </div>
</template>

<script>
// @ is an alias to /src
import Message from "@/components/home/Message.vue";
import Logo from "@/components/home/Logo.vue";
import LoadGame from "@/components/home/LoadGame.vue";
import GameList from "@/components/home/GameList.vue";
import Zip from "@/components/home/Zip.vue";

export default {
  name: "home",
  components: {
      Message,
      Logo,
      LoadGame,
      GameList,
  },
  data () {
    return {
      message: 'Загрузка...'
    }
  },
  mounted() {
    this.message = false
  },
  methods: {
    clicked (event) {
        alert(event.currentTarget.textContent)
    }
  }
};

// редирект с хеша

</script>
