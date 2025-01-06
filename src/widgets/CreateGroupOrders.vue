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
import { useLimitOrdersStore } from '@/stores/limitOrdersStore';

export default {

  setup() {
    const limitOrdersStore = useLimitOrdersStore();
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore, limitOrdersStore }
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

        //summaryData[selectedTicker]?.orderbookAverageBidPrice
        const result = await sendGroupLimitOrders(this.groupOrders);

        //console.log("Группа лимитных ордеров отправлена:", result.data);

        const limitOrders = [];

        result.data.forEach( (order) => {
          if(order.data?.message === 'success' && order.data?.orderNumber){
            limitOrders.push(order);
          }
        });

        this.limitOrdersStore.limitOrders = limitOrders;

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