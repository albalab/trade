<template>
  <div>
    <!-- Если надо что-то отобразить из хранилища (стора) -->
    <div class="fixed-widget">
      <p>Активных заявок: {{ ordersStore.limitOrdersWorking.length }}</p>
      <p>Открытых позиций: {{ Object.keys(ordersStore.activePositions).length }}</p>
      <button class="btn" @click="this.ordersStore.cancelAllOrders('MOEX', 'D88141')">Cancel all orders</button>
    </div>
  </div>
</template>

<script>
import { useOrdersStore } from "@/stores/ordersStore";
import { onMounted, onUnmounted } from "vue";

export default {
  name: "OrderManager",

  setup() {
    const ordersStore = useOrdersStore();

    onMounted(() => {
      // Загружаем все данные разово
      ordersStore.fetchAll();

      // Подключаемся к веб-сокетам
      ordersStore.connectToWebSocketOrders();
      ordersStore.connectToWebSocketPositions();
    });

    // Если нужно, можно на onUnmounted() закрывать WS:
    onUnmounted(() => {
      if (ordersStore.socketOrders) {
        ordersStore.socketOrders.close();
      }
      if (ordersStore.socketPositions) {
        ordersStore.socketPositions.close();
      }
    });

    return {
      ordersStore,
    };
  },

};
</script>

<style scoped>
/* стили, если нужны */
</style>
