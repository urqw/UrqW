<template>
  <div class="content">
    <h5 class="title is-5">
      {{ $t("loadGameHeader") }}
    </h5>

    <div class="file has-name">
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
  name: "loadGame",
  data() {
    return {
      mode: "urqw",
      dropdownIsActive: false
    };
  },
  methods: {
    selectFiles(event) {
      let loader = new Loader();

      loader.loadFiles(event.target.files, this.mode).then(Client => {
        this.$router.push({ name: "game", params: { Client: Client } });
      });
    }
  }
};
</script>
