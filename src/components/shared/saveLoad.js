export const saveLoad = {
  props: {
    Client: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      saves: []
    };
  },

  methods: {
    clickBtn(name) {
      this.$emit("clicked", name);
    },

    returnToGame() {
      this.clickBtn("returnToGame");
    },

    loadSaves() {
      this.saves = Array(10)
        .fill()
        .map((_, i) => this._readSaveName(i + 1));
    },

    _getSaveNameTimestamp() {
      const dt = new Date();
      return dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
    },

    _getSaveNameKey(id) {
      return `${this.Client.getGameName()}_${id}_name`;
    },
    _getSaveDataKey(id) {
      return `${this.Client.getGameName()}_${id}_data`;
    },

    _readSaveName(id) {
      return localStorage.getItem(this._getSaveNameKey(id));
    },
    _readSaveData(id) {
      return localStorage.getItem(this._getSaveDataKey(id));
    },

    _writeSaveName(id, data) {
      localStorage.setItem(this._getSaveNameKey(id), data);
    },

    _writeSaveData(id, data) {
      localStorage.setItem(this._getSaveDataKey(id), data);
    }
  }
};
