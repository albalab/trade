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
      positions: {}, // Реактивный массив для позиций
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
