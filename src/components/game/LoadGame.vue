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

    <SavesPanel :saves="saves" @clicked="clickLoad($event)" />
  </div>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaArrowAltCircleLeft from "@fortawesome/fontawesome-free-solid/faArrowAltCircleLeft";
import SavesPanel from "./SavesPanel";

export default {
  name: "loadgame",

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
    clickLoad(id) {
      const data = localStorage.getItem(this.Game.name + "_" + id + "_data");

      if (data) {
        this.Game.load(JSON.parse(data));

        this.clickBtn("returnToGame");
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
