<template>
  <div class="main-container">

    <div class="toolbar"
         :style="{ borderWidth: baseStore.isSidebarShow ? '200px' : '40px' }">
      <div class="main-logo" style="padding-top: 5px;">
        <a href="/#/mergedcomponent">
          <img src="@/assets/main-logo.png" style="height: 21px;"/>
        </a>

      </div>
    </div>

    <div
        class="btn-settings"
        :style="{background: !baseStore.isSidebarShow ? '#2b3041' : 'none'}"
        @click="baseStore.isSidebarShow = !baseStore.isSidebarShow;"
    >
      <i v-if="!baseStore.isSidebarShow" class="fat fa-sidebar"></i>
      <i v-else class="fat fa-sidebar"></i>
    </div>

    <div
        class="settings-pane"
        id="settingsPane"
        :style="{
          boxShadow: !baseStore.isSidebarShow ? 'none' : null,
          transform: !baseStore.isSidebarShow ? `translateX(-180px)` : null
        }">

      <div class="settings-pane-scroll">
        <div class="pane-hr pane-hr-top"></div>

        <div style="position: relative;">
          <h2 class="pane-title">Сетка</h2>

          <div
              class="reset-grid"
              @click="resetGridSettings"
          >
            <i class="fat fa-arrows-rotate"></i>
          </div>

          <div style="padding: 4px 12px 14px;">
            <div class="main-view-ranges">
              <div class="item">
                <div class="range-title">Ширина ячеек: {{ currentColumnWidth }}px</div>
                <input
                    type="range"
                    :min="slider1Min"
                    :max="slider1Max"
                    v-model="sliderValue"
                    @input="onSliderInput"
                />
              </div>
              <div class="item">
                <div class="range-title">Высота ячеек: {{ currentRowHeight }}px </div>
                <input
                    type="range"
                    :min="rowSliderMin"
                    :max="rowSliderMax"
                    v-model="rowSliderValue"
                    @input="onRowSliderInput"
                />
              </div>
              <div class="item">
                <div class="range-title">Число колонок: {{ columnsCount }}</div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    v-model="columnsCount"
                    @input="onColumnsSliderInput"
                />
              </div>
            </div>
          </div>
          <div class="pane-hr"></div>
        </div>

        <div style="position: relative;">
          <div
              class="reset-grid"
              @click="resetWidgetState"
          >
            <i class="fat fa-arrows-rotate"></i>
          </div>
          <h2 class="pane-title">Виджеты</h2>
          <div class="widgets-add">
            <ol class="widgets" id="widgetList">
              <li class="widget"
                  @click="incrementParam(wIndex)"
                  v-for="(widget, wIndex) in widgets"
                  :key="wIndex"
                  style="overflow: hidden;">

                <i class="fas fa-plus"></i>

                <div class="name">{{ widget.name }}</div>
                <div style="float: right; width: 50%;" class="control-counter">
                  <div
                      class="item item-btn item-minus"
                      @click.stop="decrementParam(wIndex)"
                  >
                    <i class="fat fa-chevron-left"></i>
                  </div>
                  <div class="item item-value" @click.stop>
                    <input
                        class="input"
                        :class="{'zero': widget.param == 0}"
                        v-model="widget.param"
                        @focus="selectInput($event)"
                        @input="onInputNumber($event, wIndex)"/>
                  </div>
                  <div
                      class="item item-btn item-plus"
                      @click.stop="incrementParam(wIndex)"
                  >
                    <i class="fat fa-chevron-right"></i>
                  </div>
                </div>
              </li>
            </ol>
            <div style="padding: 4px 12px 0;">
              <button
                  style="width: 100%;"
                  :class="{'disable': blocks.length === 0}"
                  class="btn btn-second btn-mix"
                  id="shuffleBtn"
                  @click="onShuffleClicked"
              >
                Перестроить
              </button>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
        <div
            class="btn"
            @click="baseStore.isSidebarShow = !baseStore.isSidebarShow;"
        >Закрыть</div>
      </div>
      </div>

    </div>


    <div class="main-view"
         :class="{ 'main-view-setup': baseStore.isSidebarShow }"
         :style="{
          transform: `scale(${zoomValue})`, //baseStore.isSidebarShow ? `scale(${zoomValue})` : null,
          marginLeft: baseStore.isSidebarShow ? '200px' : '10px',
         }">
      <div class="lines-grid"
           :class="{'boost': baseStore.isSidebarShow}"
           v-if="blocks.length === 0 || baseStore.isSidebarShow">
        <div v-for="(item, i) in parseInt(columnsCount)+1"
             :key="`v-${i}`"
             :style="{left: `${i * currentColumnWidth}px`}"
             class="lines-grid-v">
        </div>
        <div v-for="(item, i) in parseInt(requiredRows)+1"
             :key="`h-${i}`"
             :style="{top: `${i * currentRowHeight}px`}"
             class="lines-grid-h">
        </div>
      </div>
      <div
          class="main-grid"
          id="grid"
          :style="gridDynamicStyles">

        <div
            v-for="(blockItem, index) in blocks"
            :key="blockItem.id"
            class="widget-block"
            :class="`widget-type${blockItem.type}`"
            :style="{
              //paddingTop: !baseStore.isSidebarShow ? '6px' : '30px',
              gridRow: blockItem.gridRow || null,
              gridColumn: blockItem.gridColumn || null,
            }"
            @dragenter.prevent="onDragEnter(index, $event)"
            @dragover.prevent="onDragOver($event)"
            @dragleave="onDragLeave(index, $event)"
            @drop.prevent="onDrop(index, $event)">


          <div class="widget-title-block">
            <h3 class="widget-title"
                :style="{
                   paddingLeft: baseStore.isSidebarShow ? '24px' : '12px'
                }">
              {{blockItem.name}}
            </h3>

            <div
                v-if="baseStore.isSidebarShow"
                class="drag-handle"
                draggable="true"
                :data-block-id="blockItem.id"
                @dragstart="onDragStart(blockItem.id, $event)"
                @dragend="onDragEnd($event)"
            >
              <i class="fat fa-thin fa-arrows-up-down-left-right"></i>
            </div>

            <div class="close-block"
                 v-if="baseStore.isSidebarShow"
                 @click="removeBlock(blockItem.id)">
              <i class="fat fa-xmark"></i>
            </div>
          </div>

          <div class="widget-container" :class="cssClass">
            <slot :widget="blockItem"></slot>
          </div>

        </div>
      </div>
    </div>

    <div class="zoom-control" v-if="!isZoomShow" @click="isZoomShow = !isZoomShow;">
      <i class="fal fa-chevron-up"></i>
    </div>
    <div class="zoom-slider"
         v-if="isZoomShow">
      <input
          type="range"
          :min="0"
          :max="100"
          :value="getZoomSliderValue()"
          @input="onZoomSliderInput"
          style="margin: 0; padding: 0;"
      />
      <div style="text-align: center; color: #fff;">{{ zoomValue.toFixed(2) }}</div>
      <div
          class="close-sidebar-zoom"
          @click="isZoomShow = !isZoomShow;">
        <i class="fat fa-xmark"></i>
      </div>
    </div>

  </div>
</template>

<script>
import {useBaseStore} from "@/stores/baseStore";
export default {

  setup() {
    const baseStore = useBaseStore();

    return { baseStore }
  },

  name: "WidgetGrid",

  props: {
    widgetsProps: Array,
    cssClass: String,
  },

  data() {

    const defaultGridSettings = {
      sliderValue: 50,
      rowSliderValue: 50,
      columnsCount: 5,
    };

    return {
      isZoomShow: false,
      //isSidebarShow: false,

      widgets: this.widgetsProps,
      blocks: [],
      nextBlockId: 1,

      defaultGridSettings,
      ...defaultGridSettings,

      slider1Min: 0,
      slider1Max: 200,

      columnWidthMin: 80,
      columnWidthMax: 800,

      rowsCount: 20,

      rowSliderMin: 0,
      rowSliderMax: 200,

      rowHeightMin: 80,
      rowHeightMax: 300,

      zoomMin: 0.3,
      zoomMax: 1.5,
      zoomValue: 1.0,
    };
  },
  mounted() {

    this.restoreZoomValue(); // Восстановление zoomValue

    this.restoreGridSettings();
    this.restoreState();
    this.buildBlocksArrayFromWidgets();
  },
  computed: {
    requiredRows() {
      const totalColumns = parseInt(this.columnsCount);
      let totalBlocks = 0;

      this.blocks.forEach((block) => {
        const gridRowSpan = block.gridRow ? parseInt(block.gridRow.replace('span ', '')) : 1;
        const gridColumnSpan = block.gridColumn ? parseInt(block.gridColumn.replace('span ', '')) : 1;

        totalBlocks += gridRowSpan * gridColumnSpan;
      });

      // Рассчитываем минимальное количество строк
      let rows = Math.ceil(totalBlocks / totalColumns);

      // Гарантируем, что минимум 5 строк есть
      rows = Math.max(rows, 5);

      // Добавляем дополнительные строки для запасного пространства
      return rows + 5;
    },

    currentColumnWidth() {
      const t = (this.sliderValue - this.slider1Min) / (this.slider1Max - this.slider1Min);
      return Math.round(
          this.columnWidthMin + (this.columnWidthMax - this.columnWidthMin) * t
      );
    },
    currentRowHeight() {
      const t = (this.rowSliderValue - this.rowSliderMin) / (this.rowSliderMax - this.rowSliderMin);
      return Math.round(
          this.rowHeightMin + (this.rowHeightMax - this.rowHeightMin) * t
      );
    },
    gridDynamicStyles() {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${this.columnsCount}, ${this.currentColumnWidth}px)`,
        gridTemplateRows: `repeat(${this.requiredRows}, ${this.currentRowHeight}px)`,
        gridAutoFlow: 'row dense',
      };
    },
  },
  methods: {

    onZoomSliderInput(event) {
      // Преобразование значения из диапазона [0, 100] в [zoomMin, zoomMax]
      const value = parseFloat(event.target.value);
      this.zoomValue = this.zoomMin + ((this.zoomMax - this.zoomMin) * value) / 100;
    },
    getZoomSliderValue() {
      // Преобразование текущего значения zoomValue в диапазон [0, 100]
      return ((this.zoomValue - this.zoomMin) / (this.zoomMax - this.zoomMin)) * 100;
    },
    saveZoomValue() {
      localStorage.setItem('zoomValue', this.zoomValue);
    },

    restoreZoomValue() {
      const savedZoom = localStorage.getItem('zoomValue');
      if (savedZoom !== null) {
        const parsedZoom = parseFloat(savedZoom);
        this.zoomValue = Math.min(this.zoomMax, Math.max(this.zoomMin, parsedZoom));
      }
    },


    resetWidgetState() {
      // Сбрасываем параметры виджетов к их исходным значениям
      this.widgets = this.widgetsProps.map(widget => ({
        ...widget,
        param: 0, // Обнуляем количество для каждого виджета
      }));

      // Сбрасываем массив блоков и счётчик ID
      this.blocks = [];
      this.nextBlockId = 1;

      // Сохраняем состояние
      this.saveState();
    },

    resetGridSettings() {
      Object.assign(this, this.defaultGridSettings);
      this.saveGridSettings();
    },

    saveGridSettings() {
      const gridSettings = {
        sliderValue: this.sliderValue,
        rowSliderValue: this.rowSliderValue,
        columnsCount: this.columnsCount,
      };
      localStorage.setItem('gridSettings', JSON.stringify(gridSettings));
    },

    restoreGridSettings() {
      const savedGridSettings = localStorage.getItem('gridSettings');
      if (savedGridSettings) {
        const parsedGridSettings = JSON.parse(savedGridSettings);
        this.sliderValue = parsedGridSettings.sliderValue || this.sliderValue;
        this.rowSliderValue = parsedGridSettings.rowSliderValue || this.rowSliderValue;
        this.columnsCount = parsedGridSettings.columnsCount || this.columnsCount;
      }
    },

    saveState() {
      const state = {
        widgets: this.widgets,
        blocks: this.blocks,
        nextBlockId: this.nextBlockId,
      };
      localStorage.setItem('widgetGridState', JSON.stringify(state));
    },
    restoreState() {
      const savedState = localStorage.getItem('widgetGridState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.widgets = parsedState.widgets || this.widgets;
        this.blocks = parsedState.blocks || this.blocks;
        this.nextBlockId = parsedState.nextBlockId || this.nextBlockId;
      }
    },

    selectInput(event) {
      // Программно выделяем текст в поле ввода
      event.target.select();
    },

    onInputNumber(event, index) {
      const inputValue = event.target.value;
      // Удаляем все символы, кроме цифр
      const numericValue = inputValue.replace(/\D/g, '');
      // Обновляем значение `param` для виджета
      let p = numericValue ? parseInt(numericValue, 10) : 0;
      if(p > 100) p = 100;
      this.widgets[index].param = p;

      // При необходимости вызываем метод для обновления интерфейса
      this.buildBlocksArrayFromWidgets();
    },

    removeBlock(blockId) {
      const blockIndex = this.blocks.findIndex(block => block.id === blockId);
      if (blockIndex !== -1) {
        const block = this.blocks[blockIndex];
        const widgetIndex = this.widgets.findIndex(widget => widget.name === block.name);
        if (widgetIndex !== -1 && this.widgets[widgetIndex].param > 0) {
          this.widgets[widgetIndex].param--;
        }
        this.blocks.splice(blockIndex, 1);
      }
    },

    // Уменьшить / Увеличить param
    decrementParam(index) {
      if (this.widgets[index].param > 0) {
        this.widgets[index].param--;
        this.buildBlocksArrayFromWidgets();
      }
    },
    incrementParam(index) {
      if (this.widgets[index].param < 100) {
        this.widgets[index].param++;
        this.buildBlocksArrayFromWidgets();
      }
    },

    // Формируем blocks на основе widgets
    buildBlocksArrayFromWidgets() {
      this.blocks = [];
      this.nextBlockId = 1;
      this.widgets.forEach((w) => {
        for (let i = 0; i < w.param; i++) {
          this.blocks.push({ id: this.nextBlockId++, ...w });
        }
      });
    },

    // Перемешать виджеты (только blocks, чтоб список настроек не менялся)
    onShuffleClicked() {
      const shuffled = [...this.blocks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.blocks = shuffled;
    },

    // Бегунки
    onSliderInput() {
      this.saveGridSettings();
    },
    onColumnsSliderInput() {
      this.saveGridSettings();
    },
    onRowSliderInput() {
      this.saveGridSettings();
    },

    // === DRAG & DROP ===
    onDragStart(blockId, event) {
      event.dataTransfer.setData('text/plain', String(blockId));
      event.dataTransfer.effectAllowed = 'move';
      const blockElems = document.querySelectorAll('.widget-block');
      blockElems.forEach((b) => b.classList.add('dimmed'));
    },
    onDragEnd() {
      const blockElems = document.querySelectorAll('.widget-block');
      blockElems.forEach((b) => {
        b.classList.remove('dimmed');
        b.classList.remove('drag-over');
      });
    },
    onDragEnter(toIndex, event) {
      event.currentTarget.classList.add('drag-over');
      const blockElems = document.querySelectorAll('.widget-block');
      blockElems.forEach((b) => b.classList.add('dimmed'));
      event.currentTarget.classList.remove('dimmed');
    },
    onDragOver(event) {
      event.dataTransfer.dropEffect = 'move';
    },
    onDragLeave(toIndex, event) {
      event.currentTarget.classList.remove('drag-over');
    },
    onDrop(toIndex, event) {
      event.currentTarget.classList.remove('drag-over');
      const fromId = parseInt(event.dataTransfer.getData('text/plain'), 10);
      const fromIndex = this.blocks.findIndex((b) => b.id === fromId);
      const toBlockId = this.blocks[toIndex].id;
      const realToIndex = this.blocks.findIndex((b) => b.id === toBlockId);

      if (fromIndex !== realToIndex) {
        const draggedBlock = this.blocks.splice(fromIndex, 1)[0];
        let insertIndex = realToIndex;
        if (fromIndex < realToIndex) {
          insertIndex = realToIndex - 1;
        }
        this.blocks.splice(insertIndex, 0, draggedBlock);
      }
    },
  },
  watch: {
    zoomValue: {
      handler: "saveZoomValue"
    },
    blocks: {
      handler: "saveState",
      deep: true,
    },
    widgets: {
      handler: "saveState",
      deep: true,
    },
  },
};
</script>
