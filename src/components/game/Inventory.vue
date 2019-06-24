<template>
    <div class="inventory">
        <div class="box">
            Я ынвынтарь
        </div>
    </div>
</template>

<script>
    export default {
        name: "Inventory"
    }
</script>

<style scoped>
    .inventory {
        flex-shrink: 0;
        border-radius: 0;
        padding-left: 20%;
        display: flex;
    }

    .inventory .box {
        flex-grow: 1;
    }
</style>