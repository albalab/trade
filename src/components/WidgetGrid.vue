<template>
  <div class="main-container">

    <div class="toolbar"
         :style="{ borderWidth: isSidebarShow ? '200px' : '40px' }">
      <div class="main-logo" style="padding-top: 5px;">
        <a href="/#/mergedcomponent">
<!--          <i class="fas fa-brain-circuit" style="font-size: 16px;"></i>-->

<!--          <svg width="63" height="18" viewBox="0 0 63 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.849 8.74121C20.621 8.74121 20.411 8.68421 20.219 8.57021C20.033 8.45621 19.883 8.30621 19.769 8.12021C19.655 7.92821 19.598 7.71821 19.598 7.49021V6.99521H20.786V7.43621C20.786 7.46621 20.795 7.49321 20.813 7.51721C20.837 7.53521 20.864 7.54421 20.894 7.54421H24.773C24.803 7.54421 24.827 7.53521 24.845 7.51721C24.869 7.49321 24.881 7.46621 24.881 7.43621V6.20321C24.881 6.17321 24.869 6.14921 24.845 6.13121C24.827 6.11321 24.803 6.10421 24.773 6.10421H20.849C20.621 6.10421 20.411 6.04721 20.219 5.93321C20.033 5.81921 19.883 5.66921 19.769 5.48321C19.655 5.29121 19.598 5.07821 19.598 4.84421V3.51221C19.598 3.28421 19.655 3.07721 19.769 2.89121C19.883 2.69921 20.033 2.54621 20.219 2.43221C20.411 2.31821 20.621 2.26121 20.849 2.26121H24.827C25.055 2.26121 25.262 2.31821 25.448 2.43221C25.64 2.54621 25.793 2.69921 25.907 2.89121C26.021 3.07721 26.078 3.28421 26.078 3.51221V4.00721H24.881V3.56621C24.881 3.53621 24.869 3.51221 24.845 3.49421C24.827 3.47021 24.803 3.45821 24.773 3.45821H20.894C20.864 3.45821 20.837 3.47021 20.813 3.49421C20.795 3.51221 20.786 3.53621 20.786 3.56621V4.79921C20.786 4.82921 20.795 4.85321 20.813 4.87121C20.837 4.88921 20.864 4.89821 20.894 4.89821H24.827C25.055 4.89821 25.262 4.95521 25.448 5.06921C25.64 5.18321 25.793 5.33621 25.907 5.52821C26.021 5.71421 26.078 5.92421 26.078 6.15821V7.49021C26.078 7.71821 26.021 7.92821 25.907 8.12021C25.793 8.30621 25.64 8.45621 25.448 8.57021C25.262 8.68421 25.055 8.74121 24.827 8.74121H20.849Z" fill="#A686D7"/>
            <path d="M27.8346 8.74121V2.26121H29.0136V8.74121H27.8346Z" fill="#A686D7"/>
            <path d="M32.0364 8.74121C31.8084 8.74121 31.5984 8.68421 31.4064 8.57021C31.2204 8.45621 31.0704 8.30621 30.9564 8.12021C30.8424 7.92821 30.7854 7.71821 30.7854 7.49021V3.51221C30.7854 3.28421 30.8424 3.07721 30.9564 2.89121C31.0704 2.69921 31.2204 2.54621 31.4064 2.43221C31.5984 2.31821 31.8084 2.26121 32.0364 2.26121H36.0054C36.2334 2.26121 36.4434 2.31821 36.6354 2.43221C36.8274 2.54621 36.9804 2.69921 37.0944 2.89121C37.2084 3.07721 37.2654 3.28421 37.2654 3.51221V4.01621H36.0684V3.56621C36.0684 3.53621 36.0564 3.51221 36.0324 3.49421C36.0084 3.47021 35.9814 3.45821 35.9514 3.45821H32.0814C32.0514 3.45821 32.0244 3.47021 32.0004 3.49421C31.9824 3.51221 31.9734 3.53621 31.9734 3.56621V7.43621C31.9734 7.46621 31.9824 7.49321 32.0004 7.51721C32.0244 7.53521 32.0514 7.54421 32.0814 7.54421H35.9514C35.9814 7.54421 36.0084 7.53521 36.0324 7.51721C36.0564 7.49321 36.0684 7.46621 36.0684 7.43621V6.26621H34.6014V5.06921H37.2654V7.49021C37.2654 7.71821 37.2084 7.92821 37.0944 8.12021C36.9804 8.30621 36.8274 8.45621 36.6354 8.57021C36.4434 8.68421 36.2334 8.74121 36.0054 8.74121H32.0364Z" fill="#A686D7"/>
            <path d="M39.0661 8.74121V2.26121H40.3711L44.3491 6.99521V2.26121H45.5461V8.74121H44.2411L40.2541 3.99821V8.74121H39.0661Z" fill="#A686D7"/>
            <path d="M47.3823 8.74121V3.51221C47.3823 3.28421 47.4393 3.07721 47.5533 2.89121C47.6673 2.69921 47.8173 2.54621 48.0033 2.43221C48.1953 2.31821 48.4053 2.26121 48.6333 2.26121H52.6023C52.8303 2.26121 53.0403 2.31821 53.2323 2.43221C53.4243 2.54621 53.5773 2.69921 53.6913 2.89121C53.8053 3.07721 53.8623 3.28421 53.8623 3.51221V8.74121H52.6653V6.56321H48.5703V8.74121H47.3823ZM48.5703 5.37521H52.6653V3.56621C52.6653 3.53621 52.6533 3.51221 52.6293 3.49421C52.6053 3.47021 52.5783 3.45821 52.5483 3.45821H48.6783C48.6483 3.45821 48.6213 3.47021 48.5973 3.49421C48.5793 3.51221 48.5703 3.53621 48.5703 3.56621V5.37521Z" fill="#A686D7"/>
            <path d="M55.7068 8.74121V2.25221H56.8948V7.54421H62.1868V8.74121H55.7068Z" fill="#A686D7"/>
            <path d="M19.643 16.7412V10.2612H25.61V11.4582H20.84V12.8982H24.674V14.1042H20.84V16.7412H19.643Z" fill="#A686D7"/>
            <path d="M27.2269 16.7412V11.5122C27.2269 11.2842 27.2839 11.0772 27.3979 10.8912C27.5119 10.6992 27.6619 10.5462 27.8479 10.4322C28.0399 10.3182 28.2499 10.2612 28.4779 10.2612H32.4469C32.6749 10.2612 32.8849 10.3182 33.0769 10.4322C33.2689 10.5462 33.4219 10.6992 33.5359 10.8912C33.6499 11.0772 33.7069 11.2842 33.7069 11.5122V16.7412H32.5099V14.5632H28.4149V16.7412H27.2269ZM28.4149 13.3752H32.5099V11.5662C32.5099 11.5362 32.4979 11.5122 32.4739 11.4942C32.4499 11.4702 32.4229 11.4582 32.3929 11.4582H28.5229C28.4929 11.4582 28.4659 11.4702 28.4419 11.4942C28.4239 11.5122 28.4149 11.5362 28.4149 11.5662V13.3752Z" fill="#A686D7"/>
            <path d="M35.8394 16.7412V10.2612H40.8074C41.0354 10.2612 41.2424 10.3182 41.4284 10.4322C41.6204 10.5462 41.7734 10.6992 41.8874 10.8912C42.0014 11.0772 42.0584 11.2842 42.0584 11.5122V12.7812C42.0584 12.8592 42.0524 12.9342 42.0404 13.0062C42.0284 13.0782 42.0074 13.1472 41.9774 13.2132C42.0794 13.3512 42.1604 13.4952 42.2204 13.6452C42.2864 13.7952 42.3194 13.9452 42.3194 14.0952V15.4902C42.3194 15.7182 42.2624 15.9282 42.1484 16.1202C42.0344 16.3062 41.8814 16.4562 41.6894 16.5702C41.4974 16.6842 41.2874 16.7412 41.0594 16.7412H35.8394ZM37.1354 15.5442H41.0054C41.0354 15.5442 41.0624 15.5352 41.0864 15.5172C41.1104 15.4932 41.1224 15.4662 41.1224 15.4362V14.1492C41.1224 14.1192 41.1104 14.0952 41.0864 14.0772C41.0624 14.0532 41.0354 14.0412 41.0054 14.0412H37.1354C37.1054 14.0412 37.0784 14.0532 37.0544 14.0772C37.0364 14.0952 37.0274 14.1192 37.0274 14.1492V15.4362C37.0274 15.4662 37.0364 15.4932 37.0544 15.5172C37.0784 15.5352 37.1054 15.5442 37.1354 15.5442ZM37.1354 12.8442H40.7534C40.7834 12.8442 40.8074 12.8352 40.8254 12.8172C40.8434 12.7932 40.8524 12.7662 40.8524 12.7362V11.5662C40.8524 11.5362 40.8434 11.5122 40.8254 11.4942C40.8074 11.4702 40.7834 11.4582 40.7534 11.4582H37.1354C37.1054 11.4582 37.0784 11.4702 37.0544 11.4942C37.0364 11.5122 37.0274 11.5362 37.0274 11.5662V12.7362C37.0274 12.7662 37.0364 12.7932 37.0544 12.8172C37.0784 12.8352 37.1054 12.8442 37.1354 12.8442Z" fill="#A686D7"/>
            <path d="M49.3666 16.7412L47.4136 14.4102H48.9706L50.6626 16.4082V16.7412H49.3666ZM44.2006 16.7412V10.2702H49.4206C49.6486 10.2702 49.8586 10.3272 50.0506 10.4412C50.2426 10.5552 50.3956 10.7082 50.5096 10.9002C50.6236 11.0862 50.6806 11.2932 50.6806 11.5212V13.2672C50.6806 13.4952 50.6236 13.7052 50.5096 13.8972C50.3956 14.0892 50.2426 14.2422 50.0506 14.3562C49.8586 14.4642 49.6486 14.5182 49.4206 14.5182L45.3886 14.5272V16.7412H44.2006ZM45.4966 13.3212H49.3666C49.3966 13.3212 49.4236 13.3122 49.4476 13.2942C49.4716 13.2762 49.4836 13.2522 49.4836 13.2222V11.5662C49.4836 11.5362 49.4716 11.5122 49.4476 11.4942C49.4236 11.4702 49.3966 11.4582 49.3666 11.4582H45.4966C45.4666 11.4582 45.4396 11.4702 45.4156 11.4942C45.3976 11.5122 45.3886 11.5362 45.3886 11.5662V13.2222C45.3886 13.2522 45.3976 13.2762 45.4156 13.2942C45.4396 13.3122 45.4666 13.3212 45.4966 13.3212Z" fill="#A686D7"/>
            <path d="M52.5814 16.7412V10.2612H53.7604V16.7412H52.5814Z" fill="#A686D7"/>
            <path d="M56.8732 16.7412C56.6452 16.7412 56.4352 16.6842 56.2432 16.5702C56.0572 16.4562 55.9072 16.3062 55.7932 16.1202C55.6792 15.9282 55.6222 15.7182 55.6222 15.4902V11.5122C55.6222 11.2842 55.6792 11.0772 55.7932 10.8912C55.9072 10.6992 56.0572 10.5462 56.2432 10.4322C56.4352 10.3182 56.6452 10.2612 56.8732 10.2612H62.0842V11.4582H57.1252C57.0292 11.4582 56.9512 11.4852 56.8912 11.5392C56.8372 11.5932 56.8102 11.6712 56.8102 11.7732V15.2292C56.8102 15.3252 56.8372 15.4032 56.8912 15.4632C56.9512 15.5172 57.0292 15.5442 57.1252 15.5442H62.0842V16.7412H56.8732Z" fill="#A686D7"/>
            <path d="M8.14769 0.91217H6.358C5.43439 0.91217 4.67378 1.61207 4.5779 2.50691C3.69265 2.73062 3.0343 3.53598 3.0343 4.49154C3.0343 4.6833 3.05986 4.87185 3.111 5.04763C2.19059 5.24897 1.50028 6.06711 1.50028 7.04824C1.50028 7.52762 1.66327 7.96865 1.94131 8.317C1.07523 8.72607 0.4776 9.60813 0.4776 10.6276C0.4776 11.7206 1.16152 12.6538 2.12667 13.0181C2.05316 13.2291 2.01162 13.4592 2.01162 13.6957C2.01162 14.8238 2.92883 15.741 4.05697 15.741C4.23594 15.741 4.41172 15.7186 4.5779 15.6739C4.67058 16.5751 5.43439 17.275 6.358 17.275H8.14769V9.60494H6.10233V11.2252C6.69676 11.4362 7.12501 12.005 7.12501 12.673C7.12501 13.5199 6.4379 14.207 5.59099 14.207C4.74409 14.207 4.05697 13.5199 4.05697 12.673C4.05697 12.005 4.48522 11.4362 5.07965 11.2252V8.58226H8.14769V6.02556H7.03872C6.82779 6.61999 6.25893 7.04824 5.59099 7.04824C4.74409 7.04824 4.05697 6.36113 4.05697 5.51422C4.05697 4.66732 4.74409 3.98021 5.59099 3.98021C6.25893 3.98021 6.82779 4.40845 7.03872 5.00288H8.14769V0.91217ZM9.17037 6.02556V12.1616H10.2793C10.4903 11.5672 11.0591 11.139 11.7271 11.139C12.574 11.139 13.2611 11.8261 13.2611 12.673C13.2611 13.5199 12.574 14.207 11.7271 14.207C11.0591 14.207 10.4903 13.7787 10.2793 13.1843H9.17037V17.275H10.9601C11.8837 17.275 12.6443 16.5751 12.7402 15.6739C12.9063 15.7186 13.0821 15.741 13.2611 15.741C14.3892 15.741 15.3064 14.8238 15.3064 13.6957C15.3064 13.4592 15.2649 13.2291 15.1914 13.0181C16.1565 12.6538 16.8405 11.7206 16.8405 10.6276C16.8405 9.60813 16.2428 8.72607 15.3767 8.317C15.6548 7.96865 15.8178 7.52762 15.8178 7.04824C15.8178 6.06711 15.1275 5.24897 14.2071 5.04763C14.2582 4.87185 14.2838 4.6833 14.2838 4.49154C14.2838 3.53598 13.6254 2.73062 12.7402 2.50691C12.6411 1.61207 11.8837 0.91217 10.9601 0.91217H9.17037V5.00288H12.2384V6.62319C12.8328 6.83412 13.2611 7.40298 13.2611 8.07092C13.2611 8.91782 12.574 9.60494 11.7271 9.60494C10.8802 9.60494 10.193 8.91782 10.193 8.07092C10.193 7.40298 10.6213 6.83412 11.2157 6.62319V6.02556H9.17037ZM5.07965 5.51422C5.07965 5.64984 5.13353 5.7799 5.22942 5.87579C5.32532 5.97169 5.45538 6.02556 5.59099 6.02556C5.72661 6.02556 5.85667 5.97169 5.95256 5.87579C6.04846 5.7799 6.10233 5.64984 6.10233 5.51422C6.10233 5.37861 6.04846 5.24855 5.95256 5.15265C5.85667 5.05676 5.72661 5.00288 5.59099 5.00288C5.45538 5.00288 5.32532 5.05676 5.22942 5.15265C5.13353 5.24855 5.07965 5.37861 5.07965 5.51422ZM11.7271 7.55958C11.5914 7.55958 11.4614 7.61345 11.3655 7.70935C11.2696 7.80524 11.2157 7.9353 11.2157 8.07092C11.2157 8.20653 11.2696 8.3366 11.3655 8.43249C11.4614 8.52839 11.5914 8.58226 11.7271 8.58226C11.8627 8.58226 11.9927 8.52839 12.0886 8.43249C12.1845 8.3366 12.2384 8.20653 12.2384 8.07092C12.2384 7.9353 12.1845 7.80524 12.0886 7.70935C11.9927 7.61345 11.8627 7.55958 11.7271 7.55958ZM5.07965 12.673C5.07965 12.8086 5.13353 12.9386 5.22942 13.0345C5.32532 13.1304 5.45538 13.1843 5.59099 13.1843C5.72661 13.1843 5.85667 13.1304 5.95256 13.0345C6.04846 12.9386 6.10233 12.8086 6.10233 12.673C6.10233 12.5374 6.04846 12.4073 5.95256 12.3114C5.85667 12.2155 5.72661 12.1616 5.59099 12.1616C5.45538 12.1616 5.32532 12.2155 5.22942 12.3114C5.13353 12.4073 5.07965 12.5374 5.07965 12.673ZM11.2157 12.673C11.2157 12.8086 11.2696 12.9386 11.3655 13.0345C11.4614 13.1304 11.5914 13.1843 11.7271 13.1843C11.8627 13.1843 11.9927 13.1304 12.0886 13.0345C12.1845 12.9386 12.2384 12.8086 12.2384 12.673C12.2384 12.5374 12.1845 12.4073 12.0886 12.3114C11.9927 12.2155 11.8627 12.1616 11.7271 12.1616C11.5914 12.1616 11.4614 12.2155 11.3655 12.3114C11.2696 12.4073 11.2157 12.5374 11.2157 12.673Z" fill="#A686D7"/>
          </svg>-->

          <img src="@/assets/main-logo.png" style="height: 21px;"/>
        </a>
      </div>
    </div>

    <div
        class="btn-settings"
        @click="toggleSettingsPane"
    >
      <i v-if="!isSidebarShow" class="fat fa-bars"></i>
      <i v-else class="fat fa-xmark"></i>
    </div>

    <div
        class="settings-pane"
        id="settingsPane"
        :style="{
          boxShadow: !isSidebarShow ? 'none' : null,
          transform: !isSidebarShow ? `translateX(-180px)` : null
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
            @click="toggleSettingsPane"
        >Закрыть</div>
      </div>
      </div>

    </div>


    <div class="main-view"
         :class="{ 'main-view-setup': isSidebarShow }"
         :style="{
          transform: `scale(${zoomValue})`, //isSidebarShow ? `scale(${zoomValue})` : null,
          marginLeft: isSidebarShow ? '200px' : '10px',
         }">
      <div class="lines-grid"
           :class="{'boost': isSidebarShow}"
           v-if="blocks.length === 0 || isSidebarShow">
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
              //paddingTop: !isSidebarShow ? '6px' : '30px',
              gridRow: blockItem.gridRow || null,
              gridColumn: blockItem.gridColumn || null,
            }"
            @dragenter.prevent="onDragEnter(index, $event)"
            @dragover.prevent="onDragOver($event)"
            @dragleave="onDragLeave(index, $event)"
            @drop.prevent="onDrop(index, $event)">

          <div style="width: 100%; overflow: hidden;">
            <h3 class="widget-title"
                :style="{
                   paddingLeft: isSidebarShow ? '24px' : '12px'
                }">
              {{blockItem.name}}
            </h3>

            <div
                v-if="isSidebarShow"
                class="drag-handle"
                draggable="true"
                :data-block-id="blockItem.id"
                @dragstart="onDragStart(blockItem.id, $event)"
                @dragend="onDragEnd($event)"
            >
              <i class="fat fa-thin fa-arrows-up-down-left-right"></i>
            </div>

            <div class="close-block"
                 v-if="isSidebarShow"
                 @click="removeBlock(blockItem.id)">
              <i class="fat fa-xmark"></i>
            </div>
          </div>
          <slot :widget="blockItem"></slot>

        </div>
      </div>
    </div>

    <div class="zoom-slider"
         v-if="isSidebarShow">
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
            @click="toggleSettingsPane">
          <i class="fat fa-xmark"></i>
        </div>

    </div>

  </div>
</template>

<script>
export default {
  name: "WidgetGrid",

  props: {
    widgetsProps: Array,
  },

  data() {

    const defaultGridSettings = {
      sliderValue: 50,
      rowSliderValue: 50,
      columnsCount: 5,
    };

    return {
      isSidebarShow: false,

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

    // Кнопка «Настройки вида»
    toggleSettingsPane() {
      this.isSidebarShow = !this.isSidebarShow;
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
