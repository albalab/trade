<template>
  <div class="tabs">
    <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab"
        :class="{ active: activeTab === index }"
        @click="$emit('tab-click', index)"
    >
      {{ tab.name }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    tabs: Array,
    activeTab: Number,
  },
};
</script>
