<template>
  <div class="section-settings">
    <label v-for="setting in settings" :key="setting.key">
      <input
          :type="setting.type"
          v-model="config[setting.key]"
          :step="setting.step || 1"
          :min="setting.min"
      />
      <span class="name">{{ setting.label }}</span>
    </label>
    <div style="padding-top: 12px;">
      <button class="btn" @click="applySettings">Применить</button>
    </div>
  </div>
</template>


<script>
import { useMeshConfigStore } from "@/stores/meshConfig";

export default {
  name: "SettingsPanel",
  setup() {
    const meshConfigStore = useMeshConfigStore();
    const config = meshConfigStore.config;

    function applySettings() {
      meshConfigStore.updateConfig(config);
    }

    const settings = [
      { key: "priceStart", type: "number", label: "Начальная цена", step: 0.1 },
      { key: "gridStep", type: "number", label: "Шаг сетки", step: 0.1 },
      { key: "levelsCount", type: "number", label: "Количество уровней" },
      { key: "volume", type: "number", label: "Объем" },
      { key: "takeProfitDistance", type: "number", label: "Тейк-профит", step: 0.1 },
      { key: "volatility", type: "number", label: "Волатильность", step: 0.1 },
      { key: "interval", type: "number", label: "Интервал (мс)" },
      { key: "enableRestore", type: "checkbox", label: "Включить восстановление" },
      { key: "restoreCount", type: "number", label: "Количество восстановлений" },
    ];

    return {
      config,
      settings,
      applySettings,
    };
  },
};
</script>


<style scoped>

.section-settings{

}
.section-settings .name{
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 50px;
  box-sizing: border-box;
}
.section-settings label{
  position: relative;
  display: block;
  padding: 4px 0 6px 0;
}
.section-settings input{
  position: absolute;
  left: 0;
}
.section-settings input[type=number]{
  width: 40px;
}
</style>
