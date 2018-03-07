<template>
  <div v-if="buttons && buttons.length">
    <button v-for="button in buttons" @click="clicked(button.id)" :key="button.id" v-html="button.desc"></button>
  </div>
</template>

<script>
    export default {
        name: "buttons",
        props: {
            buttons: Array
        },
        methods: {
            clicked (action) {
                this.$emit('clicked', action)
            }
        }
    };
</script>
