<template>
  <div>
    <div v-if="isElectron">
      <!--    <div style="width: 20px; height: 27px; position: fixed; left: 0; width: 100%; top: 0px; z-index: 250; background: red; opacity: 0.05; -webkit-app-region: drag;"></div>-->
      <button style="position: fixed; left: 20px; top: 40px; z-index: 10000" @click="electronResizeWindow(800, 600)">Изменить размер окна</button>
      <button style="position: fixed; left: 20px; top: 80px; z-index: 10000" @click="electronResizeWindow(300, 200)">Изменить размер окна</button>
      <button style="position: fixed; left: 20px; top: 100px; z-index: 10000" @click="electronOpenPopup">Открыть попап</button>
    </div>
    <div v-else>
      electronAPI недоступно, так как это браузерное приложение
    </div>

  </div>
</template>

<script>

export default {

  name: "ElectronAPI",

  setup() {

  },

  data() {
    return {
      isElectron: false,
    };
  },
  methods: {
    electronResizeWindow(w, h) {
      window.electronAPI?.resizeWindow(w, h);
    },

    electronOpenPopup() {
      window.electronAPI?.openPopup();
    },

  },
  mounted() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      this.isElectron = true;
    }
  },
};
</script>
