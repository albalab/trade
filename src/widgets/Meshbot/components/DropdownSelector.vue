<template>
  <div class="bots-selector dropdown-selector">
    <span  class="name">Из шаблона:</span>
    <select v-model="localSelected" @change="updateSelection">
      <option v-for="(item, index) in items" :key="item.name" :value="index">
        {{ item.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
    selectedFromDropdown: Number,
  },
  data() {
    return {
      localSelected: this.selectedFromDropdown,
    };
  },
  watch: {
    // Синхронизация props -> data
    selectedFromDropdown(newValue) {
      this.localSelected = newValue;
    },
  },
  methods: {
    updateSelection() {
      this.$emit("update:selectedFromDropdown", this.localSelected);
    },
  },
};
</script>
