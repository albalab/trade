<template>
  <div style="max-width: 700px;">
    <h1>Эмуляция цен акций с использованием Марковских цепей</h1>
    <div>
      <label>
        Окно скользящего графика (точек):
        <input type="number" v-model.number="slidingWindowSize" min="10" max="500" />
      </label>

      <div style="max-width: 200px;">
        <h2>Настройки вероятностей (сумма = 100%)</h2>
        <div>
          <div>

            <input type="checkbox" v-model="fixedValues['рост']['рост']" />

            Рост: <input
              type="number"
              v-model.number="transitionMatrix['рост']['ростPercent']"
              :disabled="fixedValues['рост']['рост']"
              min="0"
              max="100"
              step="1"
              @input="updateProbabilityFromInput('рост', 'рост')"
          />%
            <input
                type="range"
                v-model.number="transitionMatrix['рост']['ростPercent']"
                :disabled="fixedValues['рост']['рост']"
                min="0"
                max="100"
                step="1"
                @input="updateProbabilityFromInput('рост', 'рост')"
            />
          </div>
          <div>
            <input type="checkbox" v-model="fixedValues['рост']['падение']" />
            Падение: <input
              type="number"
              v-model.number="transitionMatrix['рост']['падениеPercent']"
              :disabled="fixedValues['рост']['падение']"
              min="0"
              max="100"
              step="1"
              @input="updateProbabilityFromInput('рост', 'падение')"
          />%
            <input
                type="range"
                v-model.number="transitionMatrix['рост']['падениеPercent']"
                :disabled="fixedValues['рост']['падение']"
                min="0"
                max="100"
                step="1"
                @input="updateProbabilityFromInput('рост', 'падение')"
            />
          </div>
          <div>
            <input type="checkbox" v-model="fixedValues['рост']['флэт']" />
            Флэт: <input
              type="number"
              v-model.number="transitionMatrix['рост']['флэтPercent']"
              :disabled="fixedValues['рост']['флэт']"
              min="0"
              max="100"
              step="1"
              @input="updateProbabilityFromInput('рост', 'флэт')"
          />%
            <input
                type="range"
                v-model.number="transitionMatrix['рост']['флэтPercent']"
                :disabled="fixedValues['рост']['флэт']"
                min="0"
                max="100"
                step="1"
                @input="updateProbabilityFromInput('рост', 'флэт')"
            />
          </div>
        </div>
      </div>
    </div>
    <canvas id="priceChart" width="800" height="400"></canvas>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { Chart, registerables } from 'chart.js';

// Регистрация всех компонентов Chart.js
Chart.register(...registerables);

export default defineComponent({
  name: 'StockPriceSimulation',
  setup() {
    const slidingWindowSize = ref(100); // Размер окна для скользящего графика

    // Матрица переходов между состояниями с процентами
    const transitionMatrix = reactive({
      "рост": {
        "рост": 0.6,
        "падение": 0.2,
        "флэт": 0.2,
        get ростPercent() { return this.рост * 100; },
        set ростPercent(value) { this.рост = value / 100; },
        get падениеPercent() { return this.падение * 100; },
        set падениеPercent(value) { this.падение = value / 100; },
        get флэтPercent() { return this.флэт * 100; },
        set флэтPercent(value) { this.флэт = value / 100; }
      },
      "падение": {
        "рост": 0.3,
        "падение": 0.5,
        "флэт": 0.2,
        get ростPercent() { return this.рост * 100; },
        set ростPercent(value) { this.рост = value / 100; },
        get падениеPercent() { return this.падение * 100; },
        set падениеPercent(value) { this.падение = value / 100; },
        get флэтPercent() { return this.флэт * 100; },
        set флэтPercent(value) { this.флэт = value / 100; }
      },
      "флэт": {
        "рост": 0.4,
        "падение": 0.3,
        "флэт": 0.3,
        get ростPercent() { return this.рост * 100; },
        set ростPercent(value) { this.рост = value / 100; },
        get падениеPercent() { return this.падение * 100; },
        set падениеPercent(value) { this.падение = value / 100; },
        get флэтPercent() { return this.флэт * 100; },
        set флэтPercent(value) { this.флэт = value / 100; }
      }
    });

    // Фиксированные значения вероятностей
    const fixedValues = reactive({
      "рост": { "рост": false, "падение": false, "флэт": false },
      "падение": { "рост": false, "падение": false, "флэт": false },
      "флэт": { "рост": false, "падение": false, "флэт": false }
    });

    // Обновление значения вероятности из текстового поля (в процентах)
    function updateProbabilityFromInput(state, key) {
      adjustProbabilities(state, key);
    }

    // Функция для автоматической корректировки вероятностей
    function adjustProbabilities(state, adjustedKey) {
      const keys = Object.keys(transitionMatrix[state]).filter(key => !key.includes('Percent'));
      const total = keys.reduce((sum, key) => sum + transitionMatrix[state][key], 0);

      if (total !== 1) {
        const difference = 1 - total;
        const adjustableKeys = keys.filter(
            key => key !== adjustedKey && !fixedValues[state][key]
        );

        if (adjustableKeys.length > 0) {
          if (difference > 0) {
            // Увеличиваем остальные вероятности, если сумма меньше 1
            const increase = difference / adjustableKeys.length;
            adjustableKeys.forEach(key => {
              transitionMatrix[state][key] = Math.min(transitionMatrix[state][key] + increase, 1);
            });
          } else {
            // Уменьшаем остальные вероятности, если сумма больше 1
            const excess = -difference;
            adjustableKeys.forEach(key => {
              const reduction = Math.min(transitionMatrix[state][key], excess / adjustableKeys.length);
              transitionMatrix[state][key] -= reduction;
            });
          }
        } else {
          // Если нет свободных ключей, скорректировать только текущий
          transitionMatrix[state][adjustedKey] += difference;
        }

        // Убедимся, что сумма равна 1
        const correctedTotal = keys.reduce((sum, key) => sum + transitionMatrix[state][key], 0);
        if (correctedTotal !== 1) {
          const largestKey = keys.find(key => !fixedValues[state][key]);
          if (largestKey) {
            transitionMatrix[state][largestKey] += 1 - correctedTotal;
          }
        }
      }
    }

    // Генерация следующего состояния
    function getNextState(currentState, matrix) {
      const probabilities = matrix[currentState];
      const randomValue = Math.random();
      let cumulativeProbability = 0;

      for (const [state, probability] of Object.entries(probabilities)) {
        cumulativeProbability += probability;
        if (randomValue <= cumulativeProbability) {
          return state;
        }
      }
      return currentState; // На случай ошибок возвращаем текущее состояние
    }

    // Генерация следующей цены
    function generateNextPrice(lastPrice, currentState) {
      let nextPrice;
      if (currentState === "рост") {
        nextPrice = lastPrice * (1 + Math.random() * 0.02); // Рост 0-2%
      } else if (currentState === "падение") {
        nextPrice = lastPrice * (1 - Math.random() * 0.02); // Падение 0-2%
      } else {
        nextPrice = lastPrice * (1 + Math.random() * 0.005 - 0.0025); // Флэт ±0.25%
      }
      return parseFloat(nextPrice.toFixed(2)); // Округляем до двух знаков
    }

    onMounted(() => {
      let currentState = "рост"; // Начальное состояние
      let currentPrice = 100; // Начальная цена
      const labels = [0]; // Метки времени
      const prices = [currentPrice]; // Цены

      // Создание графика с Chart.js
      const ctx = document.getElementById("priceChart").getContext("2d");
      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Цена закрытия",
              data: prices,
              borderColor: "blue",
              borderWidth: 2,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          animation: false, // Отключение анимации
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Время (шаги)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Цена'
              }
            }
          }
        }
      });

      // Функция для обновления данных в реальном времени
      function updateChart() {
        currentState = getNextState(currentState, transitionMatrix);
        currentPrice = generateNextPrice(currentPrice, currentState);

        // Обновляем данные
        labels.push(labels.length);
        prices.push(currentPrice);

        // Ограничиваем количество точек на графике согласно slidingWindowSize
        if (labels.length > slidingWindowSize.value) {
          labels.shift();
          prices.shift();
        }

        // Обновляем график
        chart.update();
      }

      // Запуск обновлений с бесконечным потоком данных
      setInterval(updateChart, 100);
    });

    return {
      slidingWindowSize,
      transitionMatrix,
      fixedValues,
      updateProbabilityFromInput,
      adjustProbabilities
    };
  }
});
</script>

