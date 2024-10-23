<template>
  <div class="outer-container">
    <ChartComponent :candlesticks="candlesticks"/>
  </div>
</template>

<script>
import ChartComponent from './ChartComponent.vue'; // Убедитесь, что путь правильный

export default {
  components: {
    ChartComponent,
  },
  data() {
    return {
      //candlesticks: [],

      candlesticks: [
        {
          "time": {"seconds": 1729683721, "nanos": 710128543},
          "open": {"units": 196, "nano": 610374236},
          "high": {"units": 200, "nano": 867795072},
          "low": {"units": 186, "nano": 20290250},
          "close": {"units": 188, "nano": 623519344},
          "volume": 2274
        },
        {
          "time": {"seconds": 1729683781, "nanos": 875398304},
          "open": {"units": 150, "nano": 822905540},
          "high": {"units": 154, "nano": 127947864},
          "low": {"units": 150, "nano": 789266588},
          "close": {"units": 152, "nano": 616150023},
          "volume": 5156
        },
        {
          "time": {"seconds": 1729683841, "nanos": 746893661},
          "open": {"units": 102, "nano": 799016408},
          "high": {"units": 103, "nano": 352223606},
          "low": {"units": 99, "nano": 349766877},
          "close": {"units": 101, "nano": 647874384},
          "volume": 2705
        },
        {
          "time": {"seconds": 1729683901, "nanos": 949267739},
          "open": {"units": 113, "nano": 633676690},
          "high": {"units": 115, "nano": 323863669},
          "low": {"units": 104, "nano": 638613552},
          "close": {"units": 108, "nano": 377984583},
          "volume": 2211
        },
        {
          "time": {"seconds": 1729683961, "nanos": 233806870},
          "open": {"units": 123, "nano": 998563091},
          "high": {"units": 134, "nano": 3296579},
          "low": {"units": 120, "nano": 936211492},
          "close": {"units": 132, "nano": 170906659},
          "volume": 9376
        },
        {
          "time": {"seconds": 1729684021, "nanos": 185638062},
          "open": {"units": 171, "nano": 830255221},
          "high": {"units": 174, "nano": 986030756},
          "low": {"units": 170, "nano": 275145658},
          "close": {"units": 172, "nano": 239080049},
          "volume": 3356
        },
        {
          "time": {"seconds": 1729684081, "nanos": 245058661},
          "open": {"units": 121, "nano": 624188687},
          "high": {"units": 127, "nano": 108720175},
          "low": {"units": 121, "nano": 121747520},
          "close": {"units": 124, "nano": 494953965},
          "volume": 7727
        },
        {
          "time": {"seconds": 1729684141, "nanos": 190107588},
          "open": {"units": 173, "nano": 156071500},
          "high": {"units": 177, "nano": 46579147},
          "low": {"units": 159, "nano": 17298240},
          "close": {"units": 163, "nano": 182464083},
          "volume": 7515
        },
        {
          "time": {"seconds": 1729684201, "nanos": 801239315},
          "open": {"units": 118, "nano": 865359056},
          "high": {"units": 124, "nano": 207999762},
          "low": {"units": 116, "nano": 171211354},
          "close": {"units": 123, "nano": 960370853},
          "volume": 6080
        },
        {
          "time": {"seconds": 1729684261, "nanos": 184211021},
          "open": {"units": 129, "nano": 132416530},
          "high": {"units": 130, "nano": 778681497},
          "low": {"units": 124, "nano": 720590641},
          "close": {"units": 126, "nano": 678537910},
          "volume": 1553
        },
        {
          "time": {"seconds": 1729684321, "nanos": 518059433},
          "open": {"units": 143, "nano": 528202265},
          "high": {"units": 143, "nano": 721549793},
          "low": {"units": 136, "nano": 934872389},
          "close": {"units": 139, "nano": 448032489},
          "volume": 7129
        },
        {
          "time": {"seconds": 1729684381, "nanos": 87470797},
          "open": {"units": 165, "nano": 161574717},
          "high": {"units": 178, "nano": 438069745},
          "low": {"units": 162, "nano": 983740206},
          "close": {"units": 174, "nano": 114487441},
          "volume": 1400
        },
        {
          "time": {"seconds": 1729684441, "nanos": 610279070},
          "open": {"units": 193, "nano": 44459113},
          "high": {"units": 195, "nano": 761150498},
          "low": {"units": 189, "nano": 161303141},
          "close": {"units": 191, "nano": 244365210},
          "volume": 2437
        },
        {
          "time": {"seconds": 1729684501, "nanos": 300160471},
          "open": {"units": 102, "nano": 480010783},
          "high": {"units": 104, "nano": 851543123},
          "low": {"units": 102, "nano": 463598374},
          "close": {"units": 102, "nano": 512000973},
          "volume": 8977
        },
        {
          "time": {"seconds": 1729684561, "nanos": 933285185},
          "open": {"units": 138, "nano": 354328757},
          "high": {"units": 140, "nano": 70539762},
          "low": {"units": 128, "nano": 397205930},
          "close": {"units": 131, "nano": 379127654},
          "volume": 1010
        },
        {
          "time": {"seconds": 1729684621, "nanos": 223884952},
          "open": {"units": 169, "nano": 447317427},
          "high": {"units": 174, "nano": 338508726},
          "low": {"units": 167, "nano": 140578476},
          "close": {"units": 168, "nano": 653392814},
          "volume": 8635
        },
        {
          "time": {"seconds": 1729684681, "nanos": 536734665},
          "open": {"units": 193, "nano": 44424487},
          "high": {"units": 194, "nano": 280488110},
          "low": {"units": 187, "nano": 201930649},
          "close": {"units": 187, "nano": 969093532},
          "volume": 9845
        },
        {
          "time": {"seconds": 1729684741, "nanos": 706705487},
          "open": {"units": 142, "nano": 374339074},
          "high": {"units": 146, "nano": 677508957},
          "low": {"units": 136, "nano": 108435945},
          "close": {"units": 141, "nano": 28830856},
          "volume": 1635
        }
      ]
,
      socket: null,
      reconnectInterval: 5000,
      connectionStatus: 'disconnected',
      figi: 'BBG004731032',
    };
  },
  mounted() {
    this.openSocket();
  },
  beforeUnmount() {
    this.closeSocket();
  },
  methods: {
    openSocket() {
      this.connectionStatus = 'connecting';
      this.socket = new WebSocket("wss://invest-public-api.tinkoff.ru/ws/tinkoff.public.invest.api.contract.v1.MarketDataStreamService/MarketDataStream", ["json-proto", "t.N_Duppj6e3FojW1CTf0KMm8vaRCQer5e4iLFWuIoWPsEg39PLzFAr0-6113CGru5Qk_zkVXVs9Gxs7zGxgn-uw"]);

      this.socket.onopen = () => {
        this.connectionStatus = 'connected';
        this.socket.send(JSON.stringify({
          "subscribeCandlesRequest": {
            "subscriptionAction": "SUBSCRIPTION_ACTION_SUBSCRIBE",
            "instruments": [{ "figi": this.figi, "interval": 1 }]
          }
        }));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.candle) {
          this.handleCandlestick(data.candle);
        }
      };

      this.socket.onclose = () => {
        this.connectionStatus = 'disconnected';
        setTimeout(this.openSocket, this.reconnectInterval);
      };

      this.socket.onerror = () => {
        this.connectionStatus = 'error';
      };
    },
    closeSocket() {
      if (this.socket) {
        this.socket.close();
      }
    },
    handleCandlestick(candlestick) {
      if (this.candlesticks.length > 50) {
        this.candlesticks.shift();
      }
      this.candlesticks.push(candlestick); // Передаем объект свечи, как он пришел от API
    }
  }
};
</script>

<style scoped>
.outer-container {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
