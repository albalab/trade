<template>
  <div>

    <ul>
      <li v-for="(order, index) in groupOrders" :key="index" style="margin: 0 0 10px;">
        <div v-if="order.price">
          {{ index + 1 }}. {{ order.side }} {{ order.quantity }} {{ order.instrument.symbol }} по {{ order.price }} {{ order.user.portfolio }}
        </div>
      </li>
    </ul>

    <button class="btn"
            @click="sendGroupLimitOrders()">
      sendGroupLimitOrders
    </button>

    <button class="btn"
            @click="sendLimitOrder(1, 108.4, 'MTLR', 'MOEX', 'buy', 'D88141', 'MTLR 1' )">
      sendLimitOrder
    </button>

    <div style="padding-top: 6px;">
      <label class="checkbox-label" style="display: inline-block; padding-left: 21px; padding-top: 1px;">
        <input v-model="isTimerRunning" @change="toggleTimer" class="checkbox" type="checkbox" style="top: 0;"/>
        Автомат с интервалом
      </label>

      <span style=" padding-left: 8px;">
        <input v-model="count" style="width: 20px;"/> сек
      </span>
    </div>

  </div>
</template>

<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';

export default {

  setup() {
    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore, ordersStore }
  },

  data () { return {

    defaultCount: 7,
    count: 7,
    isTimerRunning: false,

    groupOrders: [
      {
        botId: 'MTLR 1',
        side: "buy",
        quantity: 1,
        price: null,
        instrument: {
          symbol: "SBER",
          exchange: "MOEX",
          instrumentGroup: "TQBR",
        },
        user: {
          portfolio: "D88141",
        },
        timeInForce: "oneday",
      },
      {
        side: "buy",
        quantity: 1,
        price: null,
        instrument: {
          symbol: "MTLR",
          exchange: "MOEX",
          instrumentGroup: "TQBR",
        },
        user: {
          portfolio: "D88141",
        },
        timeInForce: "oneday",
      }],

    sideOrder: 'buy',
    priceOrder: null,
    exchange: '',
  }},

  methods: {

    updateGroupOrders() {
      const groupOrders = [...this.groupOrders];
      //console.log(groupOrders);
      groupOrders.forEach((order) => {
        if(!this.orderbooksStore.orderbooksMetrics) return;
        if(this.orderbooksStore.orderbooksMetrics[order.instrument.symbol]?.orderbookBestBidPrice){
          order.price = this.orderbooksStore.orderbooksMetrics[order.instrument.symbol]?.orderbookBestBidPrice - 1;
        }
      });

    },

    async sendLimitOrder(volume, price, ticker, exchange, side, portfolio, extra ) {
      await this.ordersStore.sendLimitOrder(volume, price, ticker, exchange, side, portfolio, extra );
    },

    async sendGroupLimitOrders() {
      try {
        const result = await this.ordersStore.sendGroupLimitOrders(this.groupOrders);

        const newOrders = result.data.map((order, index) => {
          if (order.data?.message === "success" && order.data?.orderNumber) {
            const originalOrder = this.groupOrders[index];
            return {
              data: {
                id: order.data.orderNumber,
                orderNumber: order.data.orderNumber,
                side: originalOrder.side,
                quantity: originalOrder.quantity,
                price: originalOrder.price,
                symbol: originalOrder.instrument.symbol,
                exchange: originalOrder.instrument.exchange,
                portfolio: originalOrder.user.portfolio,
                timeInForce: originalOrder.timeInForce,
                volume: originalOrder.quantity * originalOrder.price,
                qty: originalOrder.quantity,
              },
            };
          }
          return null;
        }).filter(Boolean);

        // Объединяем старые и новые ордера
        const existingOrders = [...this.ordersStore.limitOrders];
        const updatedOrders = [...existingOrders];

        newOrders.forEach((newOrder) => {
          const existingIndex = updatedOrders.findIndex(
              (order) => order.data.id === newOrder.data.id
          );

          if (existingIndex > -1) {
            // Если ордер уже существует, обновляем его
            updatedOrders[existingIndex] = newOrder;
          } else {
            // Если ордера нет, добавляем его
            updatedOrders.push(newOrder);
          }
        });

        this.ordersStore.limitOrders = updatedOrders;

      } catch (error) {
        console.error("Ошибка при отправке группы лимитных ордеров:", error.message);
      }
    },

    startTimer() {
      const updateTimer = () => {
        if (!this.isTimerRunning) {
          clearTimeout(this.timerId); // Остановить таймер, если флаг false
          return;
        }

        this.count = this.count > 0 ? this.count - 1 : this.defaultCount;
        if (this.count === 0) {
          this.sendGroupLimitOrders();
        }

        // Планируем следующий вызов через 1 секунду
        this.timerId = setTimeout(updateTimer, 1000);
      };

      // Запускаем таймер, если флаг true
      if (this.isTimerRunning) {
        updateTimer();
      }
    },

    toggleTimer() {
      if (this.isTimerRunning) {
        // Если таймер включён, запускаем его с задержкой 5 секунд
        setTimeout(() => {
          if (this.isTimerRunning) this.startTimer();
        }, 1000);
      } else {
        // Если таймер выключен, останавливаем его
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }

  },

  mounted() {
    setInterval(() => {
      this.updateGroupOrders();
    }, 1000);



  }
}
</script>