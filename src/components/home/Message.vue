<template>
  <div class="page-header">
    <h3>{{ msg }}</h3>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    msg: String
  }
};
</script>
