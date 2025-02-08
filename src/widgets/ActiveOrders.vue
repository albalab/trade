<template>
  <div>
<!--    {{ordersStore.limitOrdersWorking}}-->
    <div class="limit-orders">
      <div class="limit-orders-head"
           v-if="ordersStore.limitOrdersWorking.length"
           style="position: relative; min-height: 10px;">
        <label class="checkbox-label">
          <input
              style="top: 4px; position: absolute;"
              class="checkbox"
              type="checkbox"
              :checked="areAllSelected"
              @change="toggleAll($event)"
          />
          <div style="padding: 4px 0 4px 20px;">Выбрать все</div>
        </label>
        <div @click="ordersStore.cancelAllOrders()"
             class="close-order">
          <i class="fat fa-xmark"></i>
        </div>
      </div>

      <div
          v-for="item in ordersStore.limitOrdersWorking"
          :key="item.data.orderNumber"
          class="limit-orders-row"
      >

        <div class="limit-order">
          <label class="checkbox-label">

            <div class="limit-order-row">

              <div>
                <input
                    class="checkbox"
                    type="checkbox"
                    :value="item.data.orderNumber"
                    v-model="selectedOrders"
                />
              </div>

              <div style="padding: 0 6px;">
                {{ item.data.orderNumber }}
              </div>

<!--              <div style="white-space: nowrap;">
                {{item.data.volume}} руб
              </div>-->

              <div style="padding: 0 20px; white-space: nowrap;">
                {{item.data.qty}} шт
              </div>

              <div style="padding: 0 20px; white-space: nowrap;">
                <span v-if="item.data.botId">{{item.data.botId}}</span>
                <span v-else>-</span>
              </div>
            </div>

          </label>
        </div>
        <div class="close-button">
          <button @click="ordersStore.cancelGroupOrders([item.data?.orderNumber])">
            <i class="fat fa-xmark" style="font-size: 12px"></i>
          </button>
        </div>
      </div>

      <div v-if="ordersStore.limitOrdersWorking.length"
           class="limit-orders-buttons">
        <button class="btn"
                :class="{'disabled': selectedOrders.length === 0}"
                @click="(selectedOrders.length > 0) ? ordersStore.cancelGroupOrders(selectedOrders) : null">
          Снять
        </button>
      </div>

      <div style="padding-top: 6px;">
        <label class="checkbox-label" style="display: inline-block; padding-left: 21px; padding-top: 1px;">
          <input v-model="isTimerRunning2" @change="toggleTimer2" class="checkbox" type="checkbox" style="top: 0;"/>
          Автомат с интервалом
        </label>

        <span style=" padding-left: 8px;">
        <input v-model="count2" style="width: 20px;"/> сек
      </span>
      </div>

    </div>
  </div>
</template>

<script>
import { useOrdersStore } from "@/stores/ordersStore";

export default {
  name: "ActiveOrders",

  setup() {
    const ordersStore = useOrdersStore();
    return { ordersStore };
  },

  data() {
    return {
      defaultCount2: 11,
      count2: 11,
      isTimerRunning2: false,

      selectedOrders: [],
    };
  },

  methods: {


    toggleAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.ordersStore.limitOrders.map(
            (item) => item.data.orderNumber
        );
      } else {
        this.selectedOrders = [];
      }
    },

    startTimer2() {
      const updateTimer = () => {
        if (!this.isTimerRunning2) {
          clearTimeout(this.timerId); // Остановить таймер, если флаг false
          return;
        }

        this.count2 = this.count2 > 0 ? this.count2 - 1 : this.defaultCount2;
        if (this.count2 === 0) {
          this.ordersStore.cancelAllOrders('MOEX', 'D88141');
        }

        // Планируем следующий вызов через 1 секунду
        this.timerId = setTimeout(updateTimer, 1000);
      };

      // Запускаем таймер, если флаг true
      if (this.isTimerRunning2) {
        updateTimer();
      }
    },

    toggleTimer2() {
      if (this.isTimerRunning2) {
        // Если таймер включён, запускаем его с задержкой 5 секунд
        setTimeout(() => {
          if (this.isTimerRunning2) this.startTimer2();
        }, 1000);
      } else {
        // Если таймер выключен, останавливаем его
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    },

  },

  mounted() {

  },

  computed: {

    areAllSelected() {
      return (
          this.selectedOrders.length === this.ordersStore.limitOrdersWorking.length &&
          this.ordersStore.limitOrdersWorking.length > 0
      );
    },
  },

  watch: {
    "ordersStore.limitOrders": {
      handler() {
        this.selectedOrders = [];
      },
    },
  },
};
</script>
