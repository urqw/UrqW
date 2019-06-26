<template>
  <div>
    <div class="panel-block-back">
      <button class="button" @click="clickBtn('returnToGame')">
        <span class="icon">
          <font-awesome-icon icon="arrow-alt-circle-left" />
        </span>
        <span v-text="$t('returnToGame')"></span>
      </button>
    </div>
    <SavesPanel :saves="saves" @clicked="clickSave($event)" />
  </div>
</template>

<script>
import SavesPanel from "./SavesPanel";

export default {
  name: "savegame",
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
    clickSave(id) {
      const data = this.Client.saveGame();

      if (data) {
        const dateTime = new Date();

        localStorage.setItem(
          this.Client.getGameName() + "_" + id.toString() + "_name",
          dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString()
        );
        localStorage.setItem(
          this.Client.getGameName() + "_" + id.toString() + "_data",
          JSON.stringify(data)
        );

        this.loadSaves();
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
  justify-content: flex-end;
  margin-bottom: 1em;
}
</style>
