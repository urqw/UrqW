<template>
  <div class="modal" :class="{ 'is-active': open }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <section class="modal-card-body">
        <slot name="body" />
      </section>
      <footer class="modal-card-foot">
        <button class="button" @click="$emit('cancel')">
          {{ $t("close") }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "Popup",
  props: {
    open: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped></style>
