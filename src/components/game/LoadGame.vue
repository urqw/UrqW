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

    <label class="file-label uploadControl dragZone" :class="{isDragging}" @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave">
      <div class="dragTarget">
        <p v-text="$t('dropFile')" class="has-text-weight-bold has-text-centered"></p>
      </div>
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
import { readFilePromise } from "../../core/tools";

export default {
  name: "LoadGame",

  mixins: [saveLoad],

  components: {
    SavesPanel
  },

  data() {
    return {
      isDragging: false
    };
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

    uploadSave(event) {
      this.onFiles(event.target.files);
    },

    async onFiles(files) {
      const saveContent = await readFilePromise(files[0], "text");
      try {
        const data = JSON.parse(saveContent);
        if (data) {
          this.Client.loadGame(data);

          this.clickBtn("returnToGame");
        }
      } catch (e) {
        console.error(e); // eslint-disable-line no-console
      }
    },

    onDrop(event) {
      const files = event.dataTransfer.files;
      this.onFiles(files);
      this.isDragging = true;
      event.preventDefault();
    },

    onDragOver(event) {
      this.isDragging = true;
      event.preventDefault();
    },

    onDragLeave(event) {
      this.isDragging = false;
      event.preventDefault();
    }
  }
};
</script>
<style scoped lang="scss">
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

.dragZone {
  position: relative;
}
.dragTarget {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: whitesmoke;
  color: #363636;
  z-index: 10;
}
.isDragging {
  .dragTarget {
    opacity: 1;
  }
}
</style>
