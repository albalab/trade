<template>
  <div>

    <ul>
      <li v-for="(order, index) in groupOrders" :key="index" style="margin: 0 0 10px;">
        {{ index + 1 }}. {{ order.side }} {{ order.quantity }} {{ order.instrument.symbol }} по {{ order.price }} {{ order.user.portfolio }}
      </li>
    </ul>
    <!-- Кнопка для отправки группы ордеров -->
    <button class="btn"
            @click="sendGroupLimitOrders()">Создать лимитки</button>
  </div>
</template>

<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { sendGroupLimitOrders } from "@/modules/LimitOrderModule";
import { useOrdersStore } from '@/stores/ordersStore';

export default {

  setup() {
    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore, ordersStore }
  },

  data () { return {

    groupOrders: [
      {
        side: "buy",
        quantity: 1,
        price: 269,
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
        price: 105,
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
          order.price = this.orderbooksStore.orderbooksMetrics[order.instrument.symbol]?.orderbookBestBidPrice;
        }
      });

    },

    async sendGroupLimitOrders() {
      try {
        const result = await sendGroupLimitOrders(this.groupOrders);

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

  },

  mounted() {
    setInterval(() => {
      this.updateGroupOrders();
    }, 1000);
  }
}
</script>