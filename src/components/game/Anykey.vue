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
    mounted: function () {
      window.addEventListener('keyup', this.submit);
      window.addEventListener('mouseup', this.submit);
    },
    methods: {
      submit(e) {
        this.$emit("anykeyDone", e.keyCode);
      }
    }
  };
</script>
