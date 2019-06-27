<template>
  <div>
    <div class="panel-block-back">
      <h2 class="subtitle" v-text="$t('saveGame')"></h2>
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
  name: "SaveGame",
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
  .panel {
    background-color: #fff;
  }
  .panel-block-back {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
  }
</style>
