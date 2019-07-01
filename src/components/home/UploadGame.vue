<template>
  <div class="content">
    <h5 class="title is-5">
      {{ $t("loadGameHeader") }}
    </h5>

    <div class="file has-name dragZone" :class="{isDragging}" @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave">
      <div class="dragTarget">
        <p v-text="$t('dropFile')" class="has-text-weight-bold has-text-centered"></p>
      </div>
      <label class="file-label">
        <input
          class="file-input"
          multiple
          type="file"
          name="resume"
          @change="selectFiles"
        />
        <span class="file-cta">
          <span class="file-icon">
            <font-awesome-icon icon="folder-open" />
          </span>
          <span class="file-label">
            {{ $t("chooseFile") }}
          </span>
        </span>
        <div class="select">
          <select v-model="mode">
            <option
              value="urqw"
              selected
              v-text="$t('noSpecialRules')"
            ></option>
            <option value="ripurq">Rip URQ 1.4</option>
            <option value="dosurq">Dos URQ 1.35</option>
          </select>
        </div>
      </label>
    </div>
  </div>
</template>

<script>
import Loader from "../../core/Loader";

export default {
  name: "UploadGame",
  data() {
    return {
      isDragging: false,
      mode: "urqw",
      dropdownIsActive: false
    };
  },
  methods: {
    selectFiles(event) {
      this.onFiles(event.target.files);
    },

    onFiles(files) {
      const loader = new Loader();

      loader.loadFiles(files, this.mode).then(Client => {
        this.$router.push({ name: "game", params: { Client: Client } });
      });
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
