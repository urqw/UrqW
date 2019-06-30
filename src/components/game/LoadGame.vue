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

    <label class="file-label uploadControl">
      <input
        class="file-input"
        accept=".urqwSave"
        type="file"
        @change="uploadSave"
      />
      <span class="file-cta">
        <span class="file-icon">
          <font-awesome-icon icon="upload" />
        </span>
        <span class="file-label">
          {{ $t("uploadSave") }}
        </span>
      </span>
    </label>

    <SavesPanel :saves="saves" @clicked="clickLoad($event)" />
  </div>
</template>

<script>
import SavesPanel from "../shared/SavesPanel";
import { saveLoad } from "../shared/saveLoad";
import { readFilePromise } from "../../core/src/tools";

export default {
  name: "LoadGame",

  mixins: [saveLoad],

  components: {
    SavesPanel
  },

  mounted() {
    this.loadSaves();
  },

  methods: {
    clickLoad(id) {
      const data = this._readSaveData(id);

      if (data) {
        this.Client.loadGame(JSON.parse(data));

        this.returnToGame();
      }
    },

    async uploadSave(event) {
      const saveContent = await readFilePromise(event.target.files[0], "text");
      try {
        const data = JSON.parse(saveContent);
        if (data) {
          this.Client.loadGame(data);

          this.clickBtn("returnToGame");
        }
      } catch (e) {
        console.error(e); // eslint-disable-line no-console
      }
    }
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
.uploadControl {
  margin-bottom: 1em;
}
</style>
