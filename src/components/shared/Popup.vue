<template>
  <div class="modal" :class="{ 'is-active': open }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <section class="modal-card-body">
        <slot name="body" />
      </section>
      <footer class="modal-card-foot">
        <button class="button" @click="close">
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
  },

  mounted() {
    document.documentElement.addEventListener('keyup', this.onDocumentKey);
  },

  beforeDestroy() {
    document.documentElement.removeEventListener('keyup', this.onDocumentKey);
  },

  methods: {
    close() {
      if (this.open) {
        this.$emit('cancel');
      }
    },
    onDocumentKey(event) {
      if (event.code === 'Escape') {
        this.close();
      }
    }
  }
};
</script>

<style scoped></style>
