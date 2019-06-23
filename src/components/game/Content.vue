<template>
  <div class="content" v-if="content.length">
    <template v-for="(cont, i) in content">
      <img
        v-if="cont.img"
        :key="i"
        :src="cont.img"
        :alt="$t('image')"
        class="cont-img"
      />
      <span
        v-else-if="cont.text"
        v-html="cont.text"
        :key="i"
        :style="{ color: cont.color || '' }"
        :class="{ ln: cont.ln }"
      ></span>
    </template>
  </div>
</template>

<script>
//    <hr>

export default {
  name: "contentText",
  props: {
    content: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>

<style scoped>
.ln:not(:last-child):after {
  content: "";
  display: block;
}
.cont-img {
  display: block;
  margin: 5px auto;
}
</style>
