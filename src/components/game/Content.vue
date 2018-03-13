<template>
  <div class="content" v-if="content && content.length">
    <template v-for="cont in content">
      <template v-if="cont.img">
        <img :src="cont.img" alt="Изображение" style="margin: 5px auto; display: block;">
      </template>
      <template v-else-if="cont.text">
        <div v-html="cont.text" :style="{ color: cont.color ? cont.color : ''}" class="{ cont.ln ? 'ln' : ''}"></div>
      </template>
    </template>
  </div>
</template>

<script>
  //    <hr>

  export default {
        name: "contentText",
        props: {
            content: Array
        }
    };
</script>

<style scoped>
  .ln {
    display: block;
  }
</style>