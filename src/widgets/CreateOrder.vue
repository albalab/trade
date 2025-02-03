<template>
  <div>
    <input v-model="priceOrder" placeholder="price"><br>
    <input v-model="exchange" placeholder="ticker"><br>
    <input v-model="sideOrder" placeholder="side"><br>
    <button class="btn"
            @click="sendLimitOrder(1, priceOrder, exchange, 'MOEX', sideOrder, 'D88141')">
    Создать лимитку
    </button>
  </div>
</template>

<script>

import { useOrdersStore } from '@/stores/ordersStore';

export default {

  setup(){
    const ordersStore = useOrdersStore();

    return {
      ordersStore
    }
  },

  data(){return {
    sideOrder: 'buy',
    priceOrder: null,
    exchange: '',
  }},

  methods: {
    async sendLimitOrder(volume, price, ticker, exchange, side, portfolio) {
      try {
        const result = await this.ordersStore.sendLimitOrder(volume, price, ticker, exchange, side, portfolio);
        console.log("Лимитный ордер отправлен:", result);
      } catch (error) {
        console.error("Ошибка при отправке лимитного ордера:", error.message);
      }
    },
  }
}
</script>