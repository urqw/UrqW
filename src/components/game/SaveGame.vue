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

    <button class="button uploadControl" @click="makeLocalSave">
      <span class="icon">
        <font-awesome-icon icon="download" />
      </span>
      <span v-text="$t('downloadSave')"></span>
    </button>

    <SavesPanel :saves="saves" @clicked="clickSave($event)" />
  </div>
</template>

<script>
import SavesPanel from "../shared/SavesPanel";
import { saveLoad } from "../shared/saveLoad";

export default {
  name: "SaveGame",

  components: {
    SavesPanel
  },

  mixins: [saveLoad],

  mounted() {
    this.loadSaves();
  },

  methods: {
    clickSave(id) {
      const data = this.Client.saveGame();

      if (data) {
        this._writeSaveName(id, this._getSaveNameTimestamp());
        this._writeSaveData(id, JSON.stringify(data));

        this.loadSaves();

        this.returnToGame();
      }
    },

    makeLocalSave() {
      const data = JSON.stringify(this.Client.saveGame());
      const href = this._getDownloadUrl(data);
      const fileName = `${this.Client.getGameName()}_${this._getSaveNameTimestamp()}.urqwSave`;

      this._createDownload(fileName, href);

      window.URL.revokeObjectURL(href);
    },

    _getDownloadUrl(data) {
      const blob = new Blob([data], { type: "octet/stream" });
      return window.URL.createObjectURL(blob);
    },

    _createDownload(fileName, contents) {
      const link = document.createElement("a");
      link.style = "display: none;";
      link.setAttribute("download", fileName);
      link.setAttribute("href", contents);

      document.body.append(link);
      link.click();
      document.body.removeChild(link);
    }
  },
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
