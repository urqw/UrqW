<template>
  <div>
    <div class="panel-block-back">
      <h2 class="subtitle" v-text="$t('loadGame')"></h2>
      <button class="button" @click="clickBtn('returnToGame')">
        <span class="icon">
          <font-awesome-icon icon="arrow-alt-circle-left" />
        </span>
        <span v-text="$t('returnToGame')"></span>
      </button>
    </div>

    <SavesPanel :saves="saves" @clicked="clickLoad($event)" />
  </div>
</template>

<script>
import SavesPanel from "./SavesPanel";

export default {
  name: "LoadGame",

  data() {
    return {
      saves: [],
    };
  },
  mounted() {
    this.loadSaves();
  },
  components: {
    SavesPanel,
  },
  methods: {
    loadSaves() {
      this.saves = Array(10)
        .fill()
        .map((_, i) => localStorage.getItem(`${this.Client.getGameName()}_${i + 1}_name`));
    },
    clickBtn(name) {
      this.$emit("clicked", name);
    },
    clickLoad(id) {
      const data = localStorage.getItem(this.Client.getGameName() + "_" + id + "_data");

      if (data) {
        this.Client.loadGame(JSON.parse(data));

        this.clickBtn("returnToGame");
      }
    }
  },
  props: {
    Client: Object
  }
};
</script>
<style scoped>
.panel-block-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}
</style>
