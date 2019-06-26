<template>
  <nav class="panel" v-if="buttons.length">
    <a
      class="panel-block"
      v-for="button in buttons"
      @click="clicked(button.id)"
      :key="button.id"
    >
      <span v-html="button.desc"></span>
    </a>
  </nav>
</template>

<script>

export default {
  name: "buttons",
  props: {
    buttons: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    clicked(action) {
      this.$emit("clicked", action);
    }
  }
};
</script>

<style scoped>
.panel {
  background-color: #fff;
}
.button {
  display: block;
}
</style>
