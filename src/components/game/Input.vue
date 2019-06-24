<template>
  <div class="field">
    <div class="control">
      <input class="input" type="text" v-on:keyup.enter="submit" v-model="inputText">
    </div>
  </div>
</template>

<script>

  export default {
    name: "inputPanel",
    data() {
      return {
        inputText: '',
      };
    },
    methods: {
      submit() {
        this.$emit("inputDone", this.inputText);
      }
    }
  };
</script>
