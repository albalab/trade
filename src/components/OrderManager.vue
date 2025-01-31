<template>
  <div></div>
</template>

<script>
import { getOrders, getPositions } from "@/modules/LimitOrderModule";
import { useOrdersStore } from '@/stores/ordersStore';

export default {
  name: "OrderManager",

  setup() {
    const ordersStore = useOrdersStore();

    return { ordersStore };
  },

  data() {
    return {

    }
  },
  methods: {
    async fetchAll() {
      try {
        const [orders, positions] = await Promise.all([
          getOrders('MOEX', 'D88141', 'Simple'),
          getPositions('MOEX', 'D88141', 'Simple', false)
        ]);

        this.processOrders(orders);

        const activePositions = {};
        positions.forEach(position => {
          if (position.symbol !== 'RUB' && position.currentVolume !== 0) {
            activePositions[position.symbol] = position;
          }
        });

        this.ordersStore.activePositions = activePositions;

      } catch (error) {
        console.log('Ошибка при загрузке всех данных:', error);
      }
    },

    async fetchPositions() {
      try {
        const positions = await getPositions('MOEX', 'D88141', 'Simple', false);

        const activePositions = {};

        positions.forEach(position => {
          if (position.symbol !== 'RUB' && position.currentVolume !== 0) {
            activePositions[position.symbol] = position;
          }
        });

        this.ordersStore.activePositions = activePositions;
      } catch (error) {
        console.error('Ошибка при загрузке позиций:', error.message);
      }
    },

    async fetchOrders() {
      try {
        const orders = await getOrders('MOEX', 'D88141', 'Simple');
        this.processOrders(orders);
      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error.message);
      }
    },

    processOrders(orders) {
      orders.forEach(order => {
        const { id, status } = order;

        if (status === "working") {
          const existingOrder = this.ordersStore.limitOrders.find(
              existing => existing.data.id === id
          );

          if (!existingOrder) {
            const enrichedOrder = {
              ...order,
              orderNumber: order.id,
            };

            this.ordersStore.limitOrders.push({ data: enrichedOrder });
          }
        } else if (status === "canceled" || status === "filled") {
          this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
              existing => existing.data.id !== id
          );
        }
      });
    },

    connectToWebSocketPositions() {
      const socket = new WebSocket("wss://signalfabric.com/positions/");

      socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.data) {
            const activePositions = { ...this.ordersStore.activePositions };

            if (data.data.symbol !== "RUB") {
              if (data.data.currentVolume === 0) {
                delete activePositions[data.data.symbol];
              } else {
                activePositions[data.data.symbol] = data.data;
              }

              this.ordersStore.activePositions = activePositions;
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for positions");
      };

      socket.onerror = error => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },

    connectToWebSocketOrders() {
      const socket = new WebSocket("wss://signalfabric.com/orders/");

      socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.data) {
            this.processOrders([data.data]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for orders");
      };

      socket.onerror = error => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }
  },

  mounted() {
    this.fetchAll();
    this.connectToWebSocketOrders();
    this.connectToWebSocketPositions();
  }
};
</script>