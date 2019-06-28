<template>
  <div>
    <Navbar :page="currentPage" :Client="Client" @clickBtn="clickBtn" />
    <div class="section" v-bind:style="backgroundStyle">
      <div class="container">
        <template v-if="Client && currentPage === 'load'">
          <LoadGame :Client="Client" @clicked="onLoadClicked"></LoadGame>
        </template>
        <template v-else-if="Client && currentPage === 'save'">
          <SaveGame :Client="Client" @clicked="onSaveClicked"></SaveGame>
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
import Loader from "@/core/Loader";

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
      currentPage: "game",
      backgroundStyle: {},
      styles: [],
      scripts: []
    };
  },

  metaInfo() {
    return {
      style: this.styles,
      script: this.scripts,
      __dangerouslyDisableSanitizers: ["script"], // welcome hackers!
    };
  },

  mounted() {
    window.addEventListener("beforunload", this.onBeforeUnload);

    if (this.$route.params.Client === undefined) {
      if (this.$route.params.name === undefined) {
        window.removeEventListener("beforeunload", this.onBeforeUnload);
        this.$router.push({ name: "home" });
        return;
      }

      let LoaderInstance = new Loader();

      LoaderInstance.loadZipFromLocalFolder(this.questName).then(client => {
        this.Client = client;
        this.backgroundStyle = this.Client.style;
        this.processCustomResources(this.Client.Game.files);
      });
    } else {
      this.Client = this.$route.params.Client;
      this.backgroundStyle = this.Client.style;
    }
  },
  methods: {
    processCustomResources(gameFiles) {
      const styles = [];
      const scripts = [];
      for (const [fileName, content] of Object.entries(gameFiles)) {
        if (fileName.endsWith(".css")) {
          styles.push({ cssText: content, type: "text/css" });
        } else if (fileName.endsWith(".js")) {
          scripts.push({ innerHTML: content });
        }
      }

      this.styles = styles;
      this.scripts = scripts;
    },

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
    onLoadClicked(name) {
      if (name === "returnToGame") {
        this.currentPage = "game";
      }
      // TODO: handle
    },
    onSaveClicked(name) {
      if (name === "returnToGame") {
        this.currentPage = "game";
      }
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
        if (confirm(this.$t("restartGameRequest"))) {
          let NewClient = this.Client.restartGame();
          if (NewClient) {
            this.Client = NewClient;
          }
        }
      } else if (name === "switchVolume") {
        const currentVolumeIndex = VOLUMES.findIndex(
          volume => volume === this.Client.getVolume()
        );

        this.Client.setVolume(
          VOLUMES[
            currentVolumeIndex + 1 === VOLUMES.length
              ? 0
              : currentVolumeIndex + 1
          ]
        );
      } else if (name === "home") {
        if (confirm(this.$t("returnToHomeScreenRequest"))) {
          window.removeEventListener("beforeunload", this.onBeforeUnload);
          this.Client.close();
          this.Client = null;
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
