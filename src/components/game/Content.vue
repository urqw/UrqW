<template>
  <div class="content" v-if="content && content.length">
    <div v-for="cont in content" v-html="cont[0]" :style="{ color: cont[3] ? '#fff' : ''}"></div>
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
