<template>
  <div>

    <!--      <div>
            <div v-for="item in limitOrdersStore.limitOrders" :key="item?.data?.orderNumber">
              {{item?.data?.orderNumber}}
              <button @click="cancelOrders([item?.data?.orderNumber])">X</button>
            </div>
            <button @click="cancelOrders">Снять группу ордеров</button>
          </div>-->

    <div class="limit-orders">
      <div class="limit-orders-head"
           v-if="limitOrdersStore.limitOrders.length">
        <label class="checkbox-label">
          <input
              class="checkbox"
              type="checkbox"
              :checked="areAllSelected"
              @change="toggleAll($event)"
          />
          Выбрать все
        </label>
      </div>
      <div v-for="item in limitOrdersStore.limitOrders"
           :key="item.data?.orderNumber"
           class="limit-orders-row">
        <div class="limit-order">
          <label class="checkbox-label">
            <input
                class="checkbox"
                type="checkbox"
                :value="item.data?.orderNumber"
                v-model="selectedOrders"
            />
            {{ item?.data?.orderNumber }} {{item?.data?.symbol}}
          </label>
        </div>
        <div class="close-button">
          <button @click="cancelOrders([item.data?.orderNumber])">X</button>
        </div>
      </div>

      <div v-if="limitOrdersStore.limitOrders.length"
           class="limit-orders-buttons">
        <!--          <button class="btn" @click="cancelAllOrders()">Снять все</button>-->
        <button class="btn"
                :class="{'disabled': selectedOrders.length === 0}"
                @click="(selectedOrders.length > 0) ? cancelOrders(selectedOrders) : null">
          Снять лимитные заявки
        </button>
      </div>

    </div>

  </div>

</template>
<script>
import { cancelGroupOrders } from "@/modules/LimitOrderModule";
import { useLimitOrdersStore } from '@/stores/limitOrdersStore';

export default {
  name: 'LimitOrders',

  setup() {
    const limitOrdersStore = useLimitOrdersStore();
    return { limitOrdersStore }
  },

  data() {
    return {
      selectedOrders: [],

    }
  },

  methods: {
    toggleAll(event) {
      if (event.target.checked) {
        this.selectedOrders = this.limitOrdersStore.limitOrders.map(item => item.data.orderNumber);
      } else {
        this.selectedOrders = [];
      }
    },

    async cancelOrders(orderIds) {
      try {

        const params = {
          orderIds: orderIds,
          portfolio: 'D88141', // Идентификатор портфеля
          exchange: 'MOEX', // Биржа MOEX
          stop: false // Является ли стоп-заявкой
        };
        //params.orderIds = ['57350744044', '57350744110'];

        const response = await cancelGroupOrders(params);

        if (response.success) {
          // Собрать список успешно удаленных orderId из response.data
          const ordersToRemove = response.data
              //.filter(order => order.success) // Оставить только успешные
              .map(order => order.orderId); // Извлечь orderId

          if (ordersToRemove.length > 0) {
            // Фильтровать limitOrders, исключая те, которые есть в ordersToRemove
            this.limitOrdersStore.limitOrders = this.limitOrdersStore.limitOrders.filter(
                order => !ordersToRemove.includes(order.data.orderNumber)
            );
          }
        }


        //console.log("Результат отмены ордеров:", response);

        if(response.success){
          if(response.data.success){
            console.log(response.data.orderId);
          }
        }

      } catch (error) {
        console.error("Ошибка при отмене ордеров:", error.message);
      }
    },
  },

  computed: {
    areAllSelected() {
      return this.selectedOrders.length === this.limitOrdersStore.limitOrders.length && this.limitOrdersStore.limitOrders.length > 0;
    },
  },

  watch: {
    'limitOrdersStore.limitOrders': {
      handler () {
        this.selectedOrders = [];
      }
    },
  }
}
</script>