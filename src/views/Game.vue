<template>
  <div class="game">
    <Navbar :page="currentPage"
            :Client="Client"
            @clickBtn="clickBtn"
            class="game-navbar"
    />
    <div class="game-content"
         v-hammer:panstart="onPanStart"
         v-hammer:panend="onPanEnd"
         v-hammer:pan="onPan"
    >
      <div class="section">
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
      <Inventory class="game-inventory"
                 :style="styleInventory"
      />
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
import Inventory from "@/components/game/Inventory.vue";
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
    Inventory,
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
      swipeStart: 0,
      swipe: 0,
      swipeActive: false,
      menuOpened: false,
      widthWindow: 0,
    };
  },
  computed: {
    styleInventory() {
      let swipe = '-100%';

      if (this.menuOpened && !this.swipeActive) {
        swipe = '0';
      } else if (this.swipeActive) {
        swipe = `calc(100% + (${this.swipe}px))`;
      }

      return { transform: `translateX(${swipe})` };
    },
  },
  mounted() {
    window.addEventListener("beforunload", this.onBeforeUnload);
    window.addEventListener("resize", this.updateWidth);

    this.updateWidth();

    if (this.$route.params.Client === undefined) {
      if (this.$route.params.name === undefined) {
        window.removeEventListener("beforeunload", this.onBeforeUnload);
        this.$router.push({ name: "home" });
        return;
      }

      let LoaderInstance = new Loader();

      LoaderInstance.loadZipFromLocalFolder(this.questName).then(
        Client => {
          this.Client = Client;
        }
      );
    } else {
      this.Client = this.$route.params.Client;
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateWidth);
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
        if (confirm(this.$t("restartGameRequest"))) {
          let NewClient = this.Client.restartGame();
          if (NewClient) {
            this.Client = NewClient;
          }
        }
      } else if (name === "switchVolume") {
        const currentVolumeIndex = VOLUMES.findIndex(volume => volume === this.Client.getVolume());

        this.Client.setVolume(VOLUMES[currentVolumeIndex + 1 === VOLUMES.length ? 0 : currentVolumeIndex + 1]);
      } else if (name === "home") {
        if (confirm(this.$t("returnToHomeScreenRequest"))) {
          window.removeEventListener("beforeunload", this.onBeforeUnload);
          this.$router.push({ name: "home" });
        }
      } else if (name === "saveGame") {
        this.currentPage = "save";
      } else if (name === "loadGame") {
        this.currentPage = "load";
      }
    },
    updateWidth() {
      this.widthWindow = window.innerWidth;
    },
    onPan(event) {
      let swipe = event.deltaX;

      if (event.deltaX > 0) {
        swipe = 0;
      } else if (event.deltaX < this.widthWindow) {
        swipe = this.widthWindow;
      }

      this.swipe = swipe;
    },
    onPanStart() {
      this.swipeActive = true;
      this.swipeStart = this.swipe;
    },
    onPanEnd(event) {
      this.swipeActive = false;
      this.swipe = event.deltaX < -60 ? this.updateWidth * -1 : 0;
    },
  }
};
</script>

<style scoped>
  .game {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .game-navbar {
    flex-shrink: 0;
  }

  .game-content {
    flex-grow: 1;
    display: flex;
    position: relative;
  }

  .game-inventory {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: translateX(100%);
  }
</style>
