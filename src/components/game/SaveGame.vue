<template>
  <div>
    <div class="panel-block-back">
      <button class="button" @click="clickBtn('returnToGame')">
        <span class="icon">
          <font-awesome-icon :icon="FaArrowAltCircleLeft" />
        </span>
        <span v-text="$t('returnToGame')"></span>
      </button>
    </div>
    <SavesPanel :saves="saves" @clicked="clickSave($event)" />
  </div>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaArrowAltCircleLeft from "@fortawesome/fontawesome-free-solid/faArrowAltCircleLeft";
import SavesPanel from "./SavesPanel";

export default {
  name: "savegame",
  data() {
    return {
      saves: [],
      FaArrowAltCircleLeft
    };
  },
  mounted() {
    this.loadSaves();
  },
  components: {
    SavesPanel,
    FontAwesomeIcon
  },
  methods: {
    loadSaves() {
      this.saves = Array(10)
        .fill()
        .map((_, i) => localStorage.getItem(`${this.Game.name}_${i + 1}_name`));
    },
    clickBtn(name) {
      this.$emit("clicked", name);
    },
    clickSave(id) {
      const data = this.Game.save();

      if (data) {
        const dateTime = new Date();

        localStorage.setItem(
          this.Game.name + "_" + id.toString() + "_name",
          dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString()
        );
        localStorage.setItem(
          this.Game.name + "_" + id.toString() + "_data",
          JSON.stringify(data)
        );

        this.loadSaves();
      }
    }
  },
  props: {
    Game: Object
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
