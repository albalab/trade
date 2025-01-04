<template>
  <div>
    {{positions}}
  </div>
</template>

<script>

export default {
  name: "PositionsStream",
  data() {
    return {
      positions: {
        /*"SBER": { "volume": 2726.7, "currentVolume": 2726.6, "symbol": "SBER", "brokerSymbol": "MOEX:SBER", "portfolio": "D88141", "exchange": "MOEX", "avgPrice": 272.67, "qtyUnits": 10, "openUnits": 0, "lotSize": 10, "shortName": "Сбербанк", "qtyT0": 0, "qtyT1": 10, "qtyT2": 10, "qtyTFuture": 10, "qtyT0Batch": 0, "qtyT1Batch": 1, "qtyT2Batch": 1, "qtyTFutureBatch": 1, "qtyBatch": 1, "openQtyBatch": 0, "qty": 1, "open": 0, "dailyUnrealisedPl": -67.7, "unrealisedPl": -0.1, "isCurrency": false, "existing": false }
      */
      },
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

            //console.log(data.data)
            const positions = {};

            if( data.data.symbol !== "RUB") {
              if( data.data.currentVolume !== 0 ){
                positions[data.data.symbol] = data.data;
              } else {
                delete positions[data.data.symbol];
              }
            }
            this.positions = positions;

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
    this.connectToWebSocket(); // Подключаемся к WebSocket при монтировании компонента
  },
};
</script>

<style scoped>
/* Минимальные стили */
</style>
