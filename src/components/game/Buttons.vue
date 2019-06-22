<template>
  <nav class="panel" v-if="buttons.length">
    <a
      class="panel-block"
      v-for="button in buttons"
      @click="clicked(button.id)"
      :key="button.id"
    >
      <span class="panel-icon">
        <font-awesome-icon :icon="FaBook" />
      </span>
      <span v-html="button.desc"></span>
    </a>
  </nav>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaBook from "@fortawesome/fontawesome-free-solid/faBook";

export default {
  name: "buttons",

  components: {
    FontAwesomeIcon
  },

  props: {
    buttons: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  data() {
    return {
      FaBook
    };
  },

  methods: {
    clicked(action) {
      this.$emit("clicked", action);
    }
  }
};
</script>

<style scoped>
.button {
  display: block;
}
/*
  .panel-block:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }

  .panel-block:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }*/
</style>
