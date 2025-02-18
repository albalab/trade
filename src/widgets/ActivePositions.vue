<template>
  <div>

<!--    <button class="btn" @click="fetchPositions2">
      Загрузить позиции
    </button>-->

    <div v-for="p in ordersStore.activePositions" :key="p.guid"
         style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; white-space: nowrap;">
      <span>{{p.symbol}} </span>
      <strong>{{p.volume.toFixed(2)}} руб</strong>
      <span style="margin-left: 10px;">{{p.qtyUnits}} шт</span>

      <strong v-if="dataFabric.lastValues.data">{{(dataFabric.lastValues.data[p.symbol].oBestAskPrice * p.qtyUnits - p.volume).toFixed(2)}} Руб</strong>

    </div>
  </div>
</template>

<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useDataFabricStore } from '@/stores/dataFabricStore';

export default {

  name: "ActivePositions",

  setup() {
    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();
    const dataFabric = useDataFabricStore();
    return { orderbooksStore, ordersStore, dataFabric }
  },

  data() {
    return {

    };
  },
  methods: {

    async fetchPositions2() {
      try {
        const positions = await this.ordersStore.getPositions('MOEX', 'D88141', 'Simple', false);

        console.log(positions);

        // Преобразуем полученные позиции и обновляем activePositions
        const activePositions = {};

        positions.forEach((position) => {
          // Исключаем валюту (например, RUB) и пустые позиции
          if (position.symbol !== 'RUB' && position.currentVolume !== 0) {
            activePositions[position.symbol] = position;
          }
        });

        // Обновляем activePositions
        this.ordersStore.activePositions = activePositions;
        //this.processPositions(positions);
      } catch (error) {
        console.error('Ошибка при загрузке позиций:', error.message);
      }
    },

    connectToWebSocket2() {
      const socket = new WebSocket("wss://signalfabric.com/positions/");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          //console.log(data);

          // Проверяем, что пришли данные о позициях
          if (data && data.data) {

            if( data.data.symbol === "RUB") return;

            const activePositions = { ...this.ordersStore.activePositions };

            if( data.data.currentVolume == 0 ){
              delete activePositions[data.data.symbol];
            } else {
              activePositions[data.data.symbol] = data.data;
            }

            this.ordersStore.activePositions = activePositions;
            /*//console.log(data.data)
            const positions = { ...this.ordersStore.activePositions };

           
              if( data.data.currentVolume !== 0 ){
                positions[data.data.symbol] = data.data;
              } else {
                //delete positions[data.data.symbol];
              }
            
            this.ordersStore.activePositions = positions;*/

          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onopen = () => {
        console.log("Connected to WebSocket for positions");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    },


  },
  mounted() {

  },
};
</script>
