<template>
  <div class="field">
    <div class="control">
      {{ this.$t("pressAnyKey") }}
    </div>
  </div>
</template>

<script>

  export default {
    name: "anykeyPanel",
    data() {
      return {
        inputText: '',
      };
    },
    created: function() {
      // todo: костыль немного, иначе сработает сразу если идет после input например
      setTimeout(() => {
        window.addEventListener('keyup', this.submit);
        window.addEventListener('mouseup', this.submit);
      }, 200);
    },
    destroyed: function() {
      window.removeEventListener('keyup', this.submit);
      window.removeEventListener('mouseup', this.submit);
    },
    methods: {
      submit(e) {
        this.$emit("anykeyDone", e.keyCode);
      }
    }
  };
</script>
