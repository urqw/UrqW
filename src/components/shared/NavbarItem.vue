<template>
  <a class="navbar-item">
    <span class="icon">
      <font-awesome-icon :icon="icon" />
    </span>
  </a>
</template>

<script>
export default {
  props: {
    icon: {
      type: [Object, String],
      required: true
    },
  }
};
</script>

<style scoped></style>
