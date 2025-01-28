<template>
  <div class="sound-language">
    <h1>Advanced Multi-Beacon Sound and Light Language</h1>

    <div class="controls">
      <button @click="startGlobalLoop">Start Global Loop</button>
      <button @click="stopGlobalLoop">Stop Global Loop</button>
    </div>

    <div class="dynamic-beacon-container">
      <div v-for="(beacon, index) in beaconCount" :key="index" :id="'dynamicBeacon' + index" class="dynamic-beacon"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

      durationMultiplier: 0.3,

      audioContext: null,
      globalLoopInterval: null,
      beaconCount: 100, // Number of beacons
      phrases: {

        1: [
          { color: 'green', duration: 1800, frequency: 440 }, // Устойчивый долгосрочный рост
          { color: 'yellow', duration: 1200, frequency: 660 }, // Активная стабильность
          { color: 'green', duration: 1500, frequency: 440 } // Усиление бычьего тренда
        ],
        2: [
          { color: 'green', duration: 1500, frequency: 440 }, // Значительный рост
          { color: 'yellow', duration: 1000, frequency: 660 }, // Умеренная волатильность
          { color: 'white', duration: 1400, frequency: 880 } // Долговременная устойчивость
        ],
        3: [
          { color: 'green', duration: 1600, frequency: 440 }, // Уверенное восстановление
          { color: 'yellow', duration: 900, frequency: 660 }, // Средний рост
          { color: 'white', duration: 1200, frequency: 880 } // Умеренная активность
        ],
        4: [
          { color: 'green', duration: 1500, frequency: 440 }, // Явный рост для лонгов
          { color: 'yellow', duration: 800, frequency: 660 }, // Умеренная волатильность
          { color: 'green', duration: 1400, frequency: 440 } // Подтверждение позитивной динамики
        ],
        5: [
          { color: 'green', duration: 1700, frequency: 440 }, // Сильный сигнал для покупки
          { color: 'yellow', duration: 1000, frequency: 660 }, // Стабильное развитие
          { color: 'green', duration: 1500, frequency: 440 } // Укрепление позиций
        ],
        6: [
          { color: 'red', duration: 1600, frequency: 220 }, // Резкое снижение
          { color: 'red', duration: 1400, frequency: 220 }, // Негативный тренд
          { color: 'yellow', duration: 1000, frequency: 660 } // Умеренная волатильность
        ],
        7: [
          { color: 'red', duration: 1500, frequency: 220 }, // Постепенное снижение
          { color: 'yellow', duration: 900, frequency: 660 }, // Средняя волатильность
          { color: 'red', duration: 1200, frequency: 220 } // Укрепление негативной тенденции
        ],
        8: [
          { color: 'red', duration: 1800, frequency: 220 }, // Сильное падение
          { color: 'yellow', duration: 1200, frequency: 660 }, // Активность с негативным уклоном
          { color: 'red', duration: 1500, frequency: 220 } // Продолжение нисходящего тренда
        ],
        9: [
          { color: 'red', duration: 1400, frequency: 220 }, // Устойчивое снижение
          { color: 'yellow', duration: 1000, frequency: 660 }, // Средний уровень волатильности
          { color: 'red', duration: 1500, frequency: 220 } // Укрепление негативной динамики
        ],
        /*10: [
          { color: 'red', duration: 1500, frequency: 220 }, // Ярко выраженный медвежий сигнал
          { color: 'yellow', duration: 800, frequency: 660 }, // Умеренная активность
          { color: 'red', duration: 1200, frequency: 220 } // Подтверждение негативного тренда
        ],
        11: [
          { color: 'blue', duration: 1200, frequency: 330 }, // Колебания вверх-вниз
          { color: 'yellow', duration: 800, frequency: 660 }, // Волатильность на среднем уровне
          { color: 'red', duration: 1000, frequency: 220 } // Преобладание продавцов
        ],
        12: [
          { color: 'blue', duration: 1400, frequency: 330 }, // Волатильность в обе стороны
          { color: 'white', duration: 1200, frequency: 880 }, // Пауза перед новым движением
          { color: 'green', duration: 1000, frequency: 440 } // Потенциальный рост
        ],
        13: [
          { color: 'blue', duration: 1000, frequency: 330 }, // Резкие скачки цены
          { color: 'yellow', duration: 900, frequency: 660 }, // Баланс активности
          { color: 'blue', duration: 1100, frequency: 330 } // Умеренная волатильность
        ],
        14: [
          { color: 'blue', duration: 1500, frequency: 330 }, // Волатильность на максимуме
          { color: 'red', duration: 1300, frequency: 220 }, // Доминирование продавцов
          { color: 'yellow', duration: 1000, frequency: 660 } // Средняя активность
        ],
        15: [
          { color: 'blue', duration: 1600, frequency: 330 }, // Продолжающаяся неопределенность
          { color: 'green', duration: 1200, frequency: 440 }, // Слабое преобладание покупателей
          { color: 'blue', duration: 1400, frequency: 330 } // Нестабильность рынка
        ]*/


        /*
        1: [
          { color: 'green', duration: 1500, frequency: 440 }, // Значительный рост индекса
          { color: 'yellow', duration: 800, frequency: 660 }, // Умеренная волатильность
          { color: 'white', duration: 1200, frequency: 880 } // Устойчивое движение
        ],
        2: [
          { color: 'red', duration: 1500, frequency: 220 }, // Значительное падение индекса
          { color: 'yellow', duration: 1000, frequency: 660 }, // Средняя волатильность
          { color: 'white', duration: 1000, frequency: 880 } // Умеренная продолжительность
        ],
        4: [
          { color: 'red', duration: 1000, frequency: 220 }, // Среднее падение
          { color: 'yellow', duration: 1500, frequency: 660 }, // Высокая волатильность
          { color: 'green', duration: 1200, frequency: 440 } // Попытка восстановления
        ],
        5: [
          { color: 'yellow', duration: 1200, frequency: 660 }, // Боковой тренд с высокой волатильностью
          { color: 'white', duration: 800, frequency: 880 }, // Кратковременная стабильность
          { color: 'blue', duration: 1400, frequency: 330 } // Умеренная волатильность
        ],
        6: [
          { color: 'green', duration: 1500, frequency: 440 }, // Ярко выраженный бычий тренд
          { color: 'green', duration: 1000, frequency: 440 }, // Средний рост
          { color: 'yellow', duration: 800, frequency: 660 } // Умеренная волатильность
        ],
        7: [
          { color: 'red', duration: 1500, frequency: 220 }, // Резкое снижение
          { color: 'red', duration: 1200, frequency: 220 }, // Постепенное падение
          { color: 'yellow', duration: 800, frequency: 660 } // Средняя волатильность
        ],
        8: [
          { color: 'blue', duration: 1000, frequency: 330 }, // Очень низкая активность
          { color: 'white', duration: 1400, frequency: 880 }, // Стабильность
          { color: 'yellow', duration: 1000, frequency: 660 } // Умеренная волатильность
        ],
        9: [
          { color: 'green', duration: 1400, frequency: 440 }, // Устойчивый рост
          { color: 'yellow', duration: 900, frequency: 660 }, // Средняя волатильность
          { color: 'red', duration: 1200, frequency: 220 } // Попытка разворота вниз
        ],
        10: [
          { color: 'white', duration: 1500, frequency: 880 }, // Долгосрочная стабильность
          { color: 'yellow', duration: 800, frequency: 660 }, // Умеренная волатильность
          { color: 'blue', duration: 1000, frequency: 330 } // Очень низкая активность
        ]*/

        /*1: [
          { color: 'green', duration: 1500, frequency: 440 },
          { color: 'yellow', duration: 800, frequency: 660 },
          { color: 'white', duration: 1200, frequency: 880 }
        ],
        2: [
          { color: 'green', duration: 1000, frequency: 440 },
          { color: 'white', duration: 1000, frequency: 880 },
          { color: 'yellow', duration: 1500, frequency: 660 }
        ],
        3: [
          { color: 'yellow', duration: 700, frequency: 660 },
          { color: 'green', duration: 1200, frequency: 440 },
          { color: 'white', duration: 900, frequency: 880 }
        ],
        4: [
          { color: 'white', duration: 1000, frequency: 880 },
          { color: 'yellow', duration: 1000, frequency: 660 },
          { color: 'green', duration: 1500, frequency: 440 }
        ],
        5: [
          { color: 'green', duration: 1400, frequency: 440 },
          { color: 'yellow', duration: 1000, frequency: 660 },
          { color: 'white', duration: 1100, frequency: 880 }
        ],
        6: [
          { color: 'red', duration: 1500, frequency: 220 },
          { color: 'blue', duration: 800, frequency: 330 },
          { color: 'red', duration: 1200, frequency: 220 }
        ],
        7: [
          { color: 'blue', duration: 1000, frequency: 330 },
          { color: 'red', duration: 1000, frequency: 220 },
          { color: 'blue', duration: 1500, frequency: 330 }
        ],
        8: [
          { color: 'red', duration: 700, frequency: 220 },
          { color: 'blue', duration: 1200, frequency: 330 },
          { color: 'red', duration: 900, frequency: 220 }
        ],
        9: [
          { color: 'blue', duration: 1000, frequency: 330 },
          { color: 'red', duration: 1000, frequency: 220 },
          { color: 'blue', duration: 1500, frequency: 330 }
        ],
        10: [
          { color: 'red', duration: 1400, frequency: 220 },
          { color: 'blue', duration: 1000, frequency: 330 },
          { color: 'red', duration: 1100, frequency: 220 }
        ],
          11: [
            { color: 'red', duration: 800, frequency: 220 },
            { color: 'blue', duration: 1200, frequency: 330 },
            { color: 'white', duration: 1000, frequency: 880 }
          ],
          12: [
            { color: 'yellow', duration: 900, frequency: 660 },
            { color: 'green', duration: 1100, frequency: 440 },
            { color: 'blue', duration: 1400, frequency: 330 }
          ],
          13: [
            { color: 'white', duration: 1200, frequency: 880 },
            { color: 'blue', duration: 1000, frequency: 330 },
            { color: 'yellow', duration: 700, frequency: 660 }
          ],
          14: [
            { color: 'red', duration: 1500, frequency: 220 },
            { color: 'green', duration: 1400, frequency: 440 },
            { color: 'blue', duration: 800, frequency: 330 }
          ],
        16: [
          { color: 'green', duration: 1500, frequency: 440 },
          { color: 'green', duration: 1500, frequency: 440 },
          { color: 'green', duration: 1500, frequency: 440 }
        ],
        17: [
          { color: 'red', duration: 1200, frequency: 220 },
          { color: 'red', duration: 1200, frequency: 220 },
          { color: 'red', duration: 1200, frequency: 220 }
        ],
        18: [
          { color: 'blue', duration: 1000, frequency: 330 },
          { color: 'blue', duration: 1000, frequency: 330 },
          { color: 'blue', duration: 1000, frequency: 330 }
        ],
        19: [
          { color: 'yellow', duration: 1400, frequency: 660 },
          { color: 'yellow', duration: 1400, frequency: 660 },
          { color: 'yellow', duration: 1400, frequency: 660 }
        ],
        20: [
          { color: 'white', duration: 1100, frequency: 880 },
          { color: 'white', duration: 1100, frequency: 880 },
          { color: 'white', duration: 1100, frequency: 880 }
        ],
*/
      },
      currentPhraseIndex: 0,
      currentBeaconIndex: 0
    };
  },
  methods: {
    playTone(frequency, duration) {
      if (this.currentOscillator) {
        this.currentOscillator.stop();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      this.currentOscillator = oscillator;

      setTimeout(() => {
        oscillator.stop();
        this.currentOscillator = null;
      }, duration);
    },
    flashDynamicBeacon(beaconIndex, color, duration) {
      const beacon = document.getElementById('dynamicBeacon' + beaconIndex);
      if (!beacon) return;


      beacon.style.backgroundColor = color;
      beacon.classList.add('active');

      setTimeout(() => {
        //beacon.style.backgroundColor = '#111';
        beacon.classList.remove('active');
      }, duration);
    },
    startGlobalLoop() {
      this.stopGlobalLoop(); // Остановить существующую петлю

      const allPhrases = Object.values(this.phrases).flat();
      const beaconCount = this.beaconCount;
      let stepIndex = 0;

      const loop = () => {
        const currentStep = allPhrases[stepIndex % allPhrases.length];
        const beaconIndex = stepIndex % beaconCount;

        const scaledDuration = currentStep.duration * this.durationMultiplier;

        this.flashDynamicBeacon(beaconIndex, currentStep.color, scaledDuration);
        this.playTone(currentStep.frequency, scaledDuration);

        stepIndex++;
        this.globalLoopInterval = setTimeout(loop, scaledDuration);
      };

      loop(); // Запуск цикла
    },

    stopGlobalLoop() {
      clearTimeout(this.globalLoopInterval);
    }
  },
  mounted() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  },
  beforeUnmount() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stopGlobalLoop();
  }
};
</script>

<style>
.sound-language {
  text-align: center;
  color: #fff;
  background-color: #000;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.controls button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.controls button:hover {
  background-color: #666;
}

.dynamic-beacon-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 90%;
  margin-top: 20px;
}


.dynamic-beacon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #111;
  opacity: 0.2;
  transition: opacity 3s ease;
}
.dynamic-beacon.active {
  transition: none;
  opacity: 1;
}
</style>
