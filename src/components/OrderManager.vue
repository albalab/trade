<template>
  <div>
    <!-- Если надо что-то отобразить из хранилища (стора) -->
    <div style="padding: 10px 20px; position: fixed; right: 0; bottom: 0; z-index: 10000; background: rgba(0,0,0,0.2); border-top-left-radius: 8px;">
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
