<template>
  <nav class="panel">
    <a
      v-for="i in 10"
      :key="i"
      class="panel-block"
      @click="$emit('clicked', i)"
    >
      {{ saves[i - 1] || `${label} #${i}` }}
    </a>
  </nav>
</template>

<script>
export default {
  name: "SavesPanel",

  props: {
    saves: {
      type: Array,
      default() {
        return [];
      }
    },

    label: {
      type: String,
      default() {
        return this.$t("emptyGameSlot");
      }
    }
  }
};
</script>

<style scoped></style>
