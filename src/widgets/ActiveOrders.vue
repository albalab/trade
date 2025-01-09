<template>
  <div>

    <!--      <div>
            <div v-for="item in ordersStore.limitOrders" :key="item?.data?.orderNumber">
              {{item?.data?.orderNumber}}
              <button @click="cancelOrders([item?.data?.orderNumber])">X</button>
            </div>
            <button @click="cancelOrders">Снять группу ордеров</button>
          </div>-->

<!--    <button class="btn" @click="fetchOrders">
      Загрузить заявки
    </button>-->

    <div class="limit-orders">
      <div class="limit-orders-head"
           v-if="ordersStore.limitOrders.length"
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
        <div @click="cancelAllOrders()"
             class="close-order">
          <i class="fat fa-xmark"></i>
        </div>
      </div>
      <div
          v-for="item in ordersStore.limitOrders"
          :key="item.data.id"
          class="limit-orders-row"
      >
        <div class="limit-order">
          <label class="checkbox-label">

            <div class="limit-order-row">

              <div>
                <input
                    class="checkbox"
                    type="checkbox"
                    :value="item.data?.orderNumber"
                    v-model="selectedOrders"
                />
              </div>

              <div>
                {{ item?.data?.symbol }}
              </div>

              <div style="white-space: nowrap;">
                {{item.data.volume}} руб
              </div>

              <div style="padding: 0 20px; white-space: nowrap;">
                {{item.data.qty}} шт
              </div>
            </div>

          </label>
        </div>
        <div class="close-button">
          <button @click="cancelOrders([item.data?.orderNumber])">
            <i class="fat fa-xmark" style="font-size: 12px"></i>
          </button>
        </div>
      </div>

      <div v-if="ordersStore.limitOrders.length"
           class="limit-orders-buttons">
        <button class="btn"
                :class="{'disabled': selectedOrders.length === 0}"
                @click="(selectedOrders.length > 0) ? cancelOrders(selectedOrders) : null">
          Снять
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {cancelGroupOrders, getOrders } from "@/modules/LimitOrderModule";
import { useOrdersStore } from "@/stores/ordersStore";

import {
  //sendLimitOrder,
  cancelAllOrders,
  //sendGroupLimitOrders,
  //cancelGroupOrders
} from '../modules/LimitOrderModule.js';

export default {
  name: "ActiveOrders",

  setup() {
    const ordersStore = useOrdersStore();
    return { ordersStore };
  },

  data() {
    return {
      selectedOrders: [],
    };
  },

  methods: {

    processOrders(orders) {
      orders.forEach((order) => {
        const { id, status } = order;

        if (status === "working") {
          const existingOrder = this.ordersStore.limitOrders.find(
              (existing) => existing.data.id === id
          );

          if (!existingOrder) {
            // Добавляем поле orderNumber, если его нет
            const enrichedOrder = {
              ...order,
              orderNumber: order.id, // Используем id как orderNumber
            };

            this.ordersStore.limitOrders.push({ data: enrichedOrder });
          }
        } else if (status === "canceled" || status === "filled") {
          this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
              (existing) => existing.data.id !== id
          );
        }
      });
    },

    async fetchOrders() {
      try {
        const orders = await getOrders('MOEX', 'D88141', 'Simple');

        console.log(orders.filter(order => order.status === 'working'));
        //console.log('Полученные заявки:', orders.filter(order => order.type === 'filled'));

        this.processOrders(orders);

      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error.message);
      }
    },

    async cancelAllOrders() {
      try {
        const exchange = 'MOEX'; // Укажите биржу
        const portfolio = 'D88141'; // Укажите портфель
        await cancelAllOrders(exchange, portfolio).then(() => {
          this.limitOrders = [];
        });

        //console.log("Все ордера успешно отменены:", result);
      } catch (error) {
        console.error("Ошибка при отмене всех ордеров:", error.message);
      }
    },

    connectToWebSocket() {
      const socket = new WebSocket("wss://signalfabric.com/orders/");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data && data.data) {
            const { id, status } = data.data;

            setTimeout(() => {
              if (status === "working") {
                const existingOrder = this.ordersStore.limitOrders.find(
                    (order) => order.data.id === id
                );

                if (!existingOrder) {
                  // Добавляем поле orderNumber, если его нет
                  const enrichedData = {
                    ...data.data,
                    orderNumber: data.data.id, // Используем id как orderNumber
                  };

                  this.ordersStore.limitOrders.push({ data: enrichedData });
                }
              } else if (status === "canceled" || status === "filled") {
                this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
                    (order) => order.data.id !== id
                );
              }
            }, 0);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for orders");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },

    toggleAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.ordersStore.limitOrders.map(
            (item) => item.data.orderNumber
        );
      } else {
        this.selectedOrders = [];
      }
    },

    async cancelOrders(orderIds) {
      try {
        const params = {
          orderIds: orderIds,
          portfolio: "D88141",
          exchange: "MOEX",
          stop: false,
        };

        const response = await cancelGroupOrders(params);

        if (response.success) {
          const ordersToRemove = response.data.map((order) => order.orderId);

          if (ordersToRemove.length > 0) {
            this.ordersStore.limitOrders = this.ordersStore.limitOrders.filter(
                (order) => !ordersToRemove.includes(order.data.orderNumber)
            );
          }
        }
      } catch (error) {
        console.error("Ошибка при отмене ордеров:", error.message);
      }
    },
  },

  mounted() {
    this.fetchOrders();
    this.connectToWebSocket();
  },

  computed: {
    areAllSelected() {
      return (
          this.selectedOrders.length === this.ordersStore.limitOrders.length &&
          this.ordersStore.limitOrders.length > 0
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
