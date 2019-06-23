<template>
  <div>
    <Navbar :page="currentPage" @clickBtn="clickBtn" />
    <div class="section">
      <div class="container">
        <template v-if="Game && currentPage === 'load'">
          <LoadGame :Game="Game" @clicked="onLoadClicked"></LoadGame>
        </template>
        <template v-else-if="Game && currentPage === 'save'">
          <SaveGame :Game="Game" @clicked="onSaveClicked"></SaveGame>
        </template>
        <template v-else>
          <Content :content="Client.text" />
          <Buttons :buttons="Client.buttons" @clicked="buttonClicked" />
          <Info />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/game/Navbar.vue";
import Buttons from "@/components/game/Buttons.vue";
import Content from "@/components/game/Content.vue";
import Input from "@/components/game/Input.vue";
import Info from "@/components/game/Info.vue";
import SaveGame from "@/components/game/SaveGame.vue";
import LoadGame from "@/components/game/LoadGame.vue";
import Loader from "@/engine/Loader";
// import Client from "@/engine/src/Client";

export default {
  name: "game",
  components: {
    Navbar,
    Buttons,
    Content,
    Input,
    Info,
    SaveGame,
    LoadGame
  },
  data() {
    return {
      questName: this.$route.params.name,
      mode: this.$route.params.mode,
      Client: {},
      Game: {},
      currentPage: "game"
    };
  },
  mounted() {
    window.addEventListener("beforunload", this.onBeforeUnload);

    if (this.$route.params.Game === undefined) {
      if (this.$route.params.name === undefined) {
        window.removeEventListener("beforeunload", this.onBeforeUnload);
        this.$router.push({ name: "home" });
        return;
      }

      let LoaderInstance = new Loader();

      LoaderInstance.loadZipFromLocalFolder(this.questName).then(
        GameInstance => {
          this.Game = GameInstance;
          this.Client = this.Game.Client;
        }
      );
    } else {
      this.Game = this.$route.params.Game;
      this.Client = this.Game.Client;
    }
  },
  methods: {
    onBeforeUnload(e) {
      // custom messages don't really work across all browsers, but still...
      // Cancel the event
      e.preventDefault();
      const msg = this.$t("confirmClose");
      // Chrome requires returnValue to be set
      e.returnValue = msg;
      // other browsers require to return a string
      return msg;
    },

    buttonClicked(action) {
      this.Client.btn(action);
    },
    onLoadClicked() {
      this.currentPage = "load";
    },
    onSaveClicked() {
      this.currentPage = "save";
    },
    clickBtn(name) {
      if (name === "returnToGame") {
        this.currentPage = "game";
      } else if (name === "restartGame") {
        if (!this.Game.locked && confirm(this.$t("restartGameRequest"))) {
          this.Game.restart();
          this.Client = this.Game.Client;
        }
      } else if (name === "switchVolume") {
        console.warn("switching volume not implemented"); // eslint-disable-line no-console
      } else if (name === "home") {
        if (
          !this.Game.locked &&
          confirm(this.$t("returnToHomeScreenRequest"))
        ) {
          window.removeEventListener("beforeunload", this.onBeforeUnload);
          this.$router.push({ name: "home" });
        }
      }
    }
  }
};
</script>
