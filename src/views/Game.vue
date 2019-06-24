<template>
  <div>
    <Navbar :page="currentPage"
            :Client="Client"
            @clickBtn="clickBtn"
    />
    <div class="section">
      <div class="container">
        <template v-if="Game && currentPage === 'load'">
          <LoadGame :Game="Game" @clicked="onLoadClicked"></LoadGame>
        </template>
        <template v-else-if="Game && currentPage === 'save'">
          <SaveGame :Game="Game" @clicked="onSaveClicked"></SaveGame>
        </template>
        <template v-else-if="Client">
          <Content :content="Client.text" @click.native="linkClicked" />
          <Buttons :buttons="Client.buttons" @clicked="buttonClicked" />
          <Info />
        </template>
        <template v-if="Client && Client.isStatusInput()">
          <Input @inputDone="inputDone" />
        </template>
        <template v-else-if="Client && Client.isStatusAnykey()">
          <Anykey @anykeyDone="anykeyDone" />
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
import Anykey from "@/components/game/Anykey.vue";
import Info from "@/components/game/Info.vue";
import SaveGame from "@/components/game/SaveGame.vue";
import LoadGame from "@/components/game/LoadGame.vue";
import Loader from "@/engine/Loader";
// import Client from "@/engine/src/Client";

import { VOLUMES } from "@/const.js";

export default {
  name: "game",
  components: {
    Navbar,
    Buttons,
    Content,
    Input,
    Anykey,
    Info,
    SaveGame,
    LoadGame
  },
  data() {
    return {
      questName: this.$route.params.name,
      mode: this.$route.params.mode,
      /** @var {Client} Client **/
      Client: null,
      /** @var {Game} Game **/
      Game: null,
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

    linkClicked(e) {
      // todo refactor this
      if (e.target.dataset.action !== undefined) {
        this.Client.linkClick(e.target.dataset.action);
      }
    },
    buttonClicked(action) {
      this.Client.btnClick(action);
    },
    onLoadClicked() {
      this.currentPage = "load";
    },
    onSaveClicked() {
      this.currentPage = "save";
    },
    inputDone(text) {
      this.Client.inputDone(text);
    },
    anykeyDone(keyCode) {
      this.Client.anykeyDone(keyCode);
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
        const currentVolumeIndex = VOLUMES.findIndex(volume => volume === this.Client.volume);

        this.Client.setVolume(VOLUMES[currentVolumeIndex + 1 === VOLUMES.length ? 0 : currentVolumeIndex + 1]);
      } else if (name === "home") {
        if (
          !this.Game.locked &&
          confirm(this.$t("returnToHomeScreenRequest"))
        ) {
          window.removeEventListener("beforeunload", this.onBeforeUnload);
          this.$router.push({ name: "home" });
        }
      } else if (name === "saveGame") {
        this.currentPage = "save";
      } else if (name === "loadGame") {
        this.currentPage = "load";
      }
    }
  }
};
</script>
