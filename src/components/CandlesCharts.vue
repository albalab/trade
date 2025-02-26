<template>
  <div>
    <h1>Родительский компонент</h1>
    <!-- Передаём пропсы в дочерний компонент -->

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 5px;">
      <div>
        IMOEX2
        <CandlesChart
            exchange="MOEX"
            :timeframe="60"
            :from="fromTimestamp"
            :to="toTimestamp"
            targetTicker="IMOEX2"
        />
      </div>
      <div>
        FLOT
        <CandlesChart
            exchange="MOEX"
            :timeframe="60"
            :from="fromTimestamp"
            :to="toTimestamp"
            targetTicker="FLOT"
        />
      </div>
      <div>
        LKOH
        <CandlesChart
            exchange="MOEX"
            :timeframe="60"
            :from="fromTimestamp"
            :to="toTimestamp"
            targetTicker="LKOH"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import CandlesChart from '@/components/CandlesChart.vue';

// Вычисляем необходимые временные метки
const currentTime = Math.floor(Date.now() / 1000);
const fromTimestamp = currentTime - (6*86400);
const toTimestamp = currentTime;
const targetTicker = 'SBER';
</script>
