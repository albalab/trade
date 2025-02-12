<template>
  <div class="tabs">
    <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="bot-item"
        :class="{
          'tab-simulator': tab.name === 'Симулятор',
          active: activeTab === index
        }"
        @click="$emit('tab-click', index)"
    >
      <i v-if="tab.name === 'Симулятор'"
         class="fal fa-gamepad-modern"></i>
      {{ tab.name }}
    </div>
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
