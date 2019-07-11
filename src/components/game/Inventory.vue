<template>
  <div id="quickviewDefault"
       class="quickview"
       :class="{ 'is-active': isActive }"
       v-if="lengthItems"
  >
    <button class="button inventory-button" @click="$emit('toggle')">
      <img src="@/assets/sack.svg">
      <span v-if="lengthItems">({{ lengthItems }})</span>
    </button>
    <header class="quickview-header">
      <p class="title">
        {{ $t("inventory") }}
      </p>
      <span class="delete" data-dismiss="quickview" @click="$emit('close')"></span>
    </header>

    <div class="quickview-body">
      <div class="quickview-block panel">
        <template v-for="item in listItems">
          <a class="panel-block inventory-item"
             :class="{ 'is-active': item.isOpened }"
             @click="onClickPanel(item)"
          >
            <span>
              {{ item.name }}
              <template v-if="item.quantity > 1"> ({{ item.quantity }})</template>
            </span>
            <font-awesome-icon v-if="itemIsHasDropdown(item)"
                               class="icon is-right"
                               :icon="item.isOpened ? 'chevron-up' : 'chevron-down'"
            />
          </a>
          <template v-if="item.isOpened && itemIsHasDropdown(item)">
            <a v-for="action in item.actions"
               class="panel-block inventory-sub-item"
               @click="callAction(action)"
            >
              {{ action.name }}
            </a>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Inventory",
    data: () => ({
      listItems: [],
    }),
    props: {
      isActive: {
        type: Boolean,
      },
      items: {
        type: Array,
        default: () => ([]),
      },
    },
    created() {
      this.loadItems();
    },
    computed: {
      lengthItems() {
        return this.listItems.length;
      },
    },
    methods: {
      itemIsHasDropdown(item) {
        return item.actions && item.actions.length && (item.actions.length > 1 || item.actions[0].name.length > 0);
      },
      loadItems() {
        this.listItems = JSON.parse(JSON.stringify(this.items));
      },
      onClickPanel(item) {
        if (this.itemIsHasDropdown(item)) {
          this.$set(item, 'isOpened', !item.isOpened);
        } else {
          if (item.actions[0] !== undefined) {
            this.callAction(item.actions[0])
          }
        }
      },
      callAction(action) {
        this.$emit('action', action.id);
      },
    },
    watch: {
      items() {
        this.loadItems();
      },
    },
  };
</script>

<style scoped lang="scss">
.inventory-button {
  position: absolute;
  right: 100%;
  top: 115px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.inventory-button img {
  min-height: 16px;
  min-width: 16px;
}

.inventory-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inventory-sub-item {
  padding-left: 1.5em;
}
</style>