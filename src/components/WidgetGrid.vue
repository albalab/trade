<template>
  <div class="main-container">

    <div class="toolbar"
         :style="{
          borderWidth: isSidebarShow ? '200px' : '40px'
         }">

<!--      <div class="main-logo" style="padding-top: 3px; cursor: pointer;">
        <a href="/#/mergedcomponent"><i class="fas fa-brain-circuit" style="font-size: 16px; "></i></a>
      </div>-->

    </div>

    <div
        class="btn-settings"
        id="settingsBtn"
        @click="toggleSettingsPane"
    >
      <i v-if="!isSidebarShow" class="fat fa-bars"></i>
      <i v-else class="fat fa-xmark"></i>
    </div>

    <div
        class="settings-pane"
        id="settingsPane"
        :style="{
        'boxShadow': !isSidebarShow ? 'none' : null,
        'transform': !isSidebarShow ? `translateX(-180px)` : null
        }">

<!--      <div
          style="position: absolute; right: 0; top: 0; width: 30px; height: 30px;"
          class="close"
          id="settingsBtn"
          @click="toggleSettingsPane"
      >

      </div>-->


      <!--      <div
                class="close"
                id="settingsBtn"
                @click="toggleSettingsPane"
            >
              X
            </div>-->

      <div class="pane-hr"></div>

      <div>
        <h2 class="pane-title">Сетка</h2>

        <div style="padding: 4px 10px 14px;">
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
              <div class="range-title">Число колонок: {{ columnsSlider }}</div>
              <input
                  type="range"
                  min="1"
                  max="20"
                  v-model="columnsSlider"
                  @input="onColumnsSliderInput"
              />
            </div>

          </div>
        </div>

        <div class="pane-hr"></div>
      </div>

      <div>
        <h2 class="pane-title">Виджеты</h2>

        <div class="widgets-add"
             style="max-height: 380px; overflow-y: auto;">
          <ol class="widgets" id="widgetList">
            <li class="widget"
                @click="incrementParam(wIndex)"
                v-for="(widget, wIndex) in widgets"
                :key="wIndex"
                style="overflow: hidden;">
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

          <div style="padding-top: 4px;">
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


<!--      <div>
        <div style="padding: 20px 10px 0; text-align: right;">
          <button
              class="btn"
              id="settingsBtn"
              @click="toggleSettingsPane"
          >
            Ок
          </button>
        </div>
      </div>-->

    </div>

    <div class="main-view"
         :class="{ 'main-view-setup': isSidebarShow }"
         :style="{
          'transform': isSidebarShow ? `scale(1)` : null,
          'marginLeft': isSidebarShow ? '200px' : '10px',
          }">

      <div class="lines-grid"
           :class="{'boost': isSidebarShow}"
           v-if="blocks.length === 0 || isSidebarShow">

        <div v-for="(item, i) in parseInt(columnsSlider)+1"
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
          :style="gridDynamicStyles"
      >
        <!-- Отрисовываем каждый блок из массива blocks -->
        <div
            v-for="(blockItem, index) in blocks"
            :key="blockItem.id"
            class="widget-block"
            :class="[
              blockItem.type === 1 ? 'widget-type1' : '',
              blockItem.type === 2 ? 'widget-type2' : '',
              blockItem.type === 3 ? 'widget-type3' : '',
              blockItem.type === 4 ? 'widget-type4' : '',
              blockItem.type === 5 ? 'widget-type5' : '',
              blockItem.type === 6 ? 'widget-type6' : '',
              blockItem.type === 7 ? 'widget-type7' : '',
              blockItem.type === 8 ? 'widget-type8' : '',
              blockItem.type === 9 ? 'widget-type9' : '',
              blockItem.type === 10 ? 'widget-type10' : '',
              blockItem.type === 11 ? 'widget-type11' : '',
              blockItem.type === 12 ? 'widget-type12' : '',
              blockItem.type === 13 ? 'widget-type13' : '',
            ]"
            @dragenter.prevent="onDragEnter(index, $event)"
            @dragover.prevent="onDragOver($event)"
            @dragleave="onDragLeave(index, $event)"
            @drop.prevent="onDrop(index, $event)"
        >
<!--          <div class="widget-block-inner">-->
            <slot :block="blockItem"></slot>
<!--            {{ blockItem.name }}-->
<!--          </div>-->
          <!-- Красная «ручка» для перетаскивания -->
          <div
              v-if="isSidebarShow"
              class="drag-handle"
              draggable="true"
              :data-block-id="blockItem.id"
              @dragstart="onDragStart(blockItem.id, $event)"
              @dragend="onDragEnd($event)"
          >
            <i class="fa-thin fa-arrows-up-down-left-right"></i>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: "WidgetGrid",
  data() {
    return {

      isSidebarShow: true,

      // Исходный список «виртуальных» виджетов
      widgets: [
        { name: 'Data Fabric', param: 0, type: 1 },
        { name: 'Alor items stats', param: 0, type: 2 },
        { name: 'Manual order', param: 0, type: 3 },
        { name: 'Top deals', param: 0, type: 4 },
        { name: 'Orders creator', param: 0, type: 5 },
        { name: 'Limit orders', param: 0, type: 6 },
        { name: 'Positions', param: 0, type: 7 },
        { name: 'Summary', param: 0, type: 8 },
        { name: 'Signals', param: 0, type: 9 },
        { name: 'Trades', param: 0, type: 10 },
        { name: 'Orderbooks', param: 0, type: 11 },
        { name: 'Candles', param: 0, type: 12 },
        { name: 'Quotes', param: 0, type: 13 },
        { name: 'Cancel all', param: 0, type: 14 },
        { name: 'Виджет 15', param: 0, type: 15 },
        { name: 'Виджет 16', param: 0, type: 16 },
      ],

      // Массив «фактических» блоков (каждый имеет уникальный id)
      blocks: [],
      // Счётчик для генерации уникальных id
      nextBlockId: 1,

      // Первый бегунок (ширина): 0..200
      slider1Min: 0,
      slider1Max: 200,
      sliderValue: 150,
      columnWidthMin: 80,
      columnWidthMax: 300,

      // Второй бегунок (число колонок): 1..20
      columnsSlider: 4,
      rowsCount: 20,

      // для бегунка высоты:
      rowSliderMin: 0,
      rowSliderMax: 200,
      rowSliderValue: 50,   // начальное положение
      rowHeightMin: 80,
      rowHeightMax: 300
    };
  },
  mounted() {
    this.buildBlocksArrayFromWidgets();
  },
  computed: {

    // Расчет минимального количества строк
    requiredRows() {
      const totalColumns = parseInt(this.columnsSlider);
      let totalBlocks = 0;

      // Учитываем количество блоков с их размерами
      this.blocks.forEach((block) => {
        const blockHeight = block.type === 4 ? 3 : block.type === 3 ? 2 : 1;
        const blockWidth = block.type === 2 ? 2 : 1;
        totalBlocks += blockHeight * blockWidth;
      });

      let rows = Math.ceil(totalBlocks / totalColumns);
      if(rows < 5) rows = 5;
      return rows + 5; // С запасом можно умножить на коэффициент (например, 1.2)
    },

    // Простая линейная интерполяция для ширины
    currentColumnWidth() {
      const t = (this.sliderValue - this.slider1Min) / (this.slider1Max - this.slider1Min);
      const clampedT = Math.max(0, Math.min(1, t));
      return Math.round(
          this.columnWidthMin + (this.columnWidthMax - this.columnWidthMin) * clampedT
      );
    },

    // НОВАЯ линейная интерполяция для высоты
    currentRowHeight() {
      const t = (this.rowSliderValue - this.rowSliderMin) / (this.rowSliderMax - this.rowSliderMin);
      const clampedT = Math.max(0, Math.min(1, t));
      return Math.round(
          this.rowHeightMin + (this.rowHeightMax - this.rowHeightMin) * clampedT
      );
    },

    // Стили для #grid: число колонок, ширина колонки, высота строки
    gridDynamicStyles() {
      return {
        display: 'grid',
        //gridGap: '5px',
        gridTemplateColumns: `repeat(${this.columnsSlider}, ${this.currentColumnWidth}px)`,
        // Вместо жёсткого 20x200px: заменяем 20 на любое количество строк,
        // но самое главное — высоту rows => currentRowHeight
        gridTemplateRows: `repeat(${this.requiredRows}, ${this.currentRowHeight}px)`,
        gridAutoFlow: 'row dense',
      };
    }
  },
  methods: {

    selectInput(event) {
      // Программно выделяем текст в поле ввода
      event.target.select();
    },

    onInputNumber(event, index) {
      const inputValue = event.target.value;
      // Удаляем все символы, кроме цифр
      const numericValue = inputValue.replace(/\D/g, '');
      // Обновляем значение `param` для виджета
      this.widgets[index].param = numericValue ? parseInt(numericValue, 10) : 0;

      // При необходимости вызываем метод для обновления интерфейса
      this.buildBlocksArrayFromWidgets();
    },

    // Кнопка «Настройки вида»
    toggleSettingsPane() {
      this.isSidebarShow = !this.isSidebarShow;
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
          this.blocks.push({
            id: this.nextBlockId++,
            name: w.name,
            type: w.type
          });
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
      // Колонки (ширина)
    },
    onColumnsSliderInput() {
      // Число колонок
    },
    onRowSliderInput() {
      // НОВЫЙ метод для высоты
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
  }
};
</script>

<style>

  /* Виджет типа 2: занимает две колонки */
  .widget-type2 {
    grid-column: span 2;
  }

  /* Виджет типа 3: занимает две строки */
  .widget-type3 {
    grid-row: span 2;
  }

  .widget-type4 {
    grid-row: span 3;
  }

  .widget-type8 {
    grid-column: span 4;
    grid-row: span 2;
  }

  .widget-type9,
  .widget-type10,
  .widget-type11,
  .widget-type12,
  .widget-type13 {
    /*grid-column: span 4;*/
    grid-row: span 4;
  }
</style>
