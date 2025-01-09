<template>
  <div>
    <div v-for="p in ordersStore.activePositions" :key="p.guid">
      {{p.symbol}} <strong>{{p.volume.toFixed(2)}}</strong>
      <span style="margin-left: 10px;">{{p.qtyUnits}}</span>
      <strong v-if="this.orderbooksStore.orderbooksMetrics[p.symbol]" style="margin-left: 10px;">
          {{((this.orderbooksStore.orderbooksMetrics[p.symbol]?.orderbookBestAskPrice * p.qtyUnits) - p.volume).toFixed(2)}}
      </strong><!--{{p.qtyUnits}}, {{p.avgPrice}}<br>-->
    </div>
  </div>
</template>

<script>
import { useOrderbooksStore } from '@/stores/orderbooksStore';
import { useOrdersStore } from '@/stores/ordersStore';

export default {

  name: "ActivePositions",

  setup() {
    const ordersStore = useOrdersStore();
    const orderbooksStore = useOrderbooksStore();
    return { orderbooksStore, ordersStore }
  },

  data() {
    return {

    };
  },
  methods: {
    connectToWebSocket() {
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
    this.connectToWebSocket();
  },
};
</script>

<style scoped>
/* Минимальные стили */
</style>
