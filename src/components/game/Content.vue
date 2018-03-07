<template>
  <div v-if="content && content.length">
    <div v-for="cont in content" v-html="cont[0]" :style="{ color: cont[3] ? '#fff' : '#000'}"></div>
  </div>
</template>

<script>
    export default {
        name: "contentText",
        props: {
            content: Array
        }
    };
</script>
