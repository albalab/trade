<template>
  <div id="app" class="ttrade-app">

<!--    <div v-if="receivedMessage">
      <p>{{ receivedMessage }}</p>
    </div>-->

    <router-view />

  </div>
</template>

<script>

export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      receivedMessage: null, // Храним полученное сообщение
    };
  },
  methods: {
    // Метод для обработки входящих сообщений от iframe
    handleMessage(event) {
      // Проверим источник сообщения, чтобы убедиться, что это наш iframe
      // Можете добавить проверку event.origin для безопасности
      if (event.data && typeof event.data === 'object') {
        // Обновляем состояние, чтобы показать сообщение в интерфейсе
        this.receivedMessage = `Время: ${event.data.time}, Данные: ${event.data.data}`;
      }
    }
  },
  mounted() {
    // Добавляем слушатель на событие message
    window.addEventListener('message', this.handleMessage);
  },
  beforeUnmount() {
    // Удаляем слушатель при уничтожении компонента
    window.removeEventListener('message', this.handleMessage);
  }
}
</script>

<style>

html, body, input, button{
  font-family: 'Verdana';
  font-size: 9px;
}
html, body{
  padding: 0;
  margin: 0;
  letter-spacing: -0.02em;
  color: rgba(209, 214, 247, 0.9);
  background: #242736;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-smoothing: antialiased;
}

ul, ol, li{
  padding: 0;
  margin: 0;
  list-style: none;
}
input{
  border-radius: 2px;
  background: rgba(255,255,255,0.05);
  border: solid 1px rgba(255,255,255,0.1);
  margin: 0 0 4px;
  color: rgba(209, 214, 247, 0.9);
}
input:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: rgba(255, 11, 247, 0.41);
}

.stats-diagram {
  padding: 5px;
}
h1, h2 ,h3, h4, h5, h6{
  padding: 0;
  margin: 0;
}
.stats-diagram .inner {
}

.stats-diagram .cell {
  padding-bottom: 5px;
}

.stats-diagram .ticker {
  white-space: nowrap;
  display: inline-block;
  width: 40px;
  opacity: 1;
  cursor: pointer;
}

.stats-diagram .progress-bar-container {
  position: relative;
  margin: -1px 0 0;
}

.stats-diagram .progress-bar {
  position: absolute;
  height: 2px;
  background: rgba(0,0,0,0.4);
}

.btn.disabled{
  opacity: 0.15;
}
.btn{
  background: rgba(175, 100, 240, 1);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  margin: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
}
.btn:hover{
  background: rgba(150, 50, 240, 1);
}


#grid {
  display: grid;
  grid-gap: 0;
  grid-template-columns: repeat(5, 200px);
  grid-template-rows: repeat(20, 200px);
  grid-auto-flow: row dense;
}

.widget-block {
  background: #32374c;
  text-align: center;
  position: relative;
  margin: 2px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  /*transition: margin 0.1s ease-out;*/
}
.widget-block-inner{
  /*height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;*/
}


/* Красный блок (ручка) */
.drag-handle {
  width: 20px;
  height: 20px;
  background: rgba(255,255,255,0.1);
  position: absolute;
  top: 0;
  left: 0;
  cursor: move;
  user-select: none;
}

/* Затемнение */
.dimmed {
  opacity: 0.3;
}
/* Подсветка при dragenter */
.drag-over {
  outline: 2px dashed #ff9800;
  border-color: #ff9800;
  background: #353848;
}

.main-container{
  padding-top: 40px;
}
.main-grid{
  width: 100%;
}
.main-view {
  margin: 20px 0 120px;
  position: relative;
  transform-origin: left top;
  width: fit-content;
  border-radius: 4px;

  /*transition: transform 0.2s cubic-bezier(0.19, 1, 0.22, 1), margin 0.2s cubic-bezier(0.19, 1, 0.22, 1), background 0.2s cubic-bezier(0.19, 1, 0.22, 1), border 0.2s cubic-bezier(0.19, 1, 0.22, 1);
*/
}
.main-view-setup{
  box-sizing: border-box;
  /*background: #20222d;*/
}
.settings-pane {
  user-select: none;
  margin-bottom: 20px;
  display: block;

  /*transition: transform 0.2s cubic-bezier(0.19, 1, 0.22, 1), margin 0.2s cubic-bezier(0.19, 1, 0.22, 1);*/
  width: 180px;
  height: 100vh;
  position: fixed;
  z-index: 100;
  background: #2d3144;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  /*box-shadow: inset -1px 0 0 0 rgba(255,255,255,0.1);*/
}
.settings-pane .close{
  width: 36px;
  height: 36px;
  position: absolute;
  right: 0;
  top: 0;
  font-size: 12px;
  text-align: center;
  line-height: 36px;
  cursor: pointer;
}
.pane-title{
  padding: 12px 10px 0;
  font-size: 9px;
  text-transform: uppercase;
  color: #c3c8eb;
}
.pane-hr{
  border-top: solid 1px rgba(255,255,255,0.05);
}
.main-view-ranges{

}
.range-title{
  margin: 0 0 2px;
  opacity: 0.5;
}
.main-view-ranges .item{
  margin: 0 0 10px;
}
.main-view-ranges input,
.main-view-ranges span{
  display: block;
}
.main-view-ranges input{
  margin-right: 6px;
}
.btn-settings{
  margin: 0;
  position: absolute;
  left: 20px;
  top: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 600;
  padding: 5px 12px;
}
/*.btn-settings .arrow{
  font-size: 14px;
  vertical-align: middle;
}*/

.toolbar{
  width: 100%;
  position: fixed;
  z-index: 200;
  top: 0;
  height: 40px;
  left: 0;
  background: #32364b;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.lines-grid{
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}
.lines-grid-v{
  position: absolute;
  width: 1px;
  height: 100%;
  border-left: dashed 1px rgba(255,255,255,0.3);
}
.lines-grid-h{
  position: absolute;
  width: 100%;
  height: 1px;
  border-top: dashed 1px rgba(255,255,255,0.3);
}
.lines-grid.boost .lines-grid-v{
  border-left: dashed 1px rgba(255,255,255,0.2);
}
.lines-grid.boost .lines-grid-h{
  border-top: dashed 1px rgba(255,255,255,0.2);
}

.control-counter{
  overflow: hidden;
  grid-template-columns: 1fr 1fr 1fr;
  white-space: nowrap;
  max-width: 44px;
  text-align: center;
}
.control-counter .item{
  height: 14px;
  line-height: 12px;
  display: block;
  float: left;
}
.control-counter .item:first-child,
.control-counter .item:last-child{
  width: 30%;
}
.control-counter .item-value{
  width: 40%;
}
.control-counter .item:first-child{
  float: left;
}
.control-counter .item:last-child{
  float: right;
}
.control-counter .item-btn{
  opacity: 0.7;
  cursor: pointer;
}
.control-counter .item-btn:hover{
  opacity: 1;
}
.control-counter .item-value{

}
.control-counter .input.zero{
  font-weight: 400;
  color: #999;
}
.control-counter .input{
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  border: none;
  background: none;
  text-align: center;
  font-weight: 600;
  color: white;
}

.widgets-add{
  padding: 10px 10px 0;
  margin-bottom: 20px;
}

.widgets{
  margin: 0 0 10px;
}
.widgets .widget{
  margin: 0;
  padding: 2px 0;
}
.widgets .widget:hover{
  background: rgba(0,0,0,0.1);
}
.widgets .name{
  float: left;
  width: 40%;
  padding-top: 2px;
}

.btn-mix.disable{
  background: #2a2d3f;
  color: #3f4561;
}
input[type=range]{
  filter: hue-rotate(50deg);
  width: 125%;
  transform: scale(0.8);
  transform-origin: left;
}
</style>

