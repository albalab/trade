<template>
  <div class="sound-language">
    <h1>Advanced Multi-Beacon Sound and Light Language</h1>

    <div class="controls">
      <button v-for="n in 10" :key="n" @click="startLoop(n)">
        Start Phrase {{ n }} Loop
      </button>
      <button @click="stopLoop">Stop Loop</button>
    </div>

    <div class="beacon-container">
      <div v-for="n in 3" :key="n" :id="'beacon' + n" class="beacon"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      audioContext: null,
      loopInterval: null,
      phrases: {
        1: [
          { frequency: 880, duration: 1500, beacon: 0, color: 'green' },
          { frequency: 770, duration: 800, beacon: 1, color: 'yellow' },
          { frequency: 990, duration: 1200, beacon: 2, color: 'white' }
        ],
        2: [
          { frequency: 880, duration: 1000, beacon: 0, color: 'green' },
          { frequency: 990, duration: 1000, beacon: 1, color: 'white' },
          { frequency: 770, duration: 1500, beacon: 2, color: 'yellow' }
        ],
        3: [
          { frequency: 770, duration: 700, beacon: 0, color: 'yellow' },
          { frequency: 880, duration: 1200, beacon: 1, color: 'green' },
          { frequency: 990, duration: 900, beacon: 2, color: 'white' }
        ],
        4: [
          { frequency: 990, duration: 1000, beacon: 0, color: 'white' },
          { frequency: 770, duration: 1000, beacon: 1, color: 'yellow' },
          { frequency: 880, duration: 1500, beacon: 2, color: 'green' }
        ],
        5: [
          { frequency: 880, duration: 1400, beacon: 0, color: 'green' },
          { frequency: 770, duration: 1000, beacon: 1, color: 'yellow' },
          { frequency: 990, duration: 1100, beacon: 2, color: 'white' }
        ],
        6: [
          { frequency: 220, duration: 1500, beacon: 0, color: 'red' },
          { frequency: 330, duration: 800, beacon: 1, color: 'blue' },
          { frequency: 180, duration: 1200, beacon: 2, color: 'red' }
        ],
        7: [
          { frequency: 330, duration: 1000, beacon: 0, color: 'blue' },
          { frequency: 220, duration: 1000, beacon: 1, color: 'red' },
          { frequency: 180, duration: 1500, beacon: 2, color: 'blue' }
        ],
        8: [
          { frequency: 220, duration: 700, beacon: 0, color: 'red' },
          { frequency: 330, duration: 1200, beacon: 1, color: 'blue' },
          { frequency: 180, duration: 900, beacon: 2, color: 'red' }
        ],
        9: [
          { frequency: 330, duration: 1000, beacon: 0, color: 'blue' },
          { frequency: 220, duration: 1000, beacon: 1, color: 'red' },
          { frequency: 180, duration: 1500, beacon: 2, color: 'blue' }
        ],
        10: [
          { frequency: 220, duration: 1400, beacon: 0, color: 'red' },
          { frequency: 330, duration: 1000, beacon: 1, color: 'blue' },
          { frequency: 180, duration: 1100, beacon: 2, color: 'red' }
        ]
      }
    };
  },
  methods: {
    playTone(frequency, duration) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, duration);
    },
    flashBeacon(beaconIndex, color, duration) {
      const beacon = document.getElementById('beacon' + (beaconIndex + 1));
      if (!beacon) return;

      beacon.style.backgroundColor = color;
      setTimeout(() => {
        beacon.style.backgroundColor = '#111';
      }, duration);
    },
    playPhrase(phraseNumber) {
      const phrase = this.phrases[phraseNumber];
      let delay = 0;

      phrase.forEach(step => {
        setTimeout(() => {
          this.playTone(step.frequency, step.duration);
          this.flashBeacon(step.beacon, step.color, step.duration);
        }, delay);

        delay += step.duration;
      });

      return delay; // Total duration of the phrase
    },
    startLoop(phraseNumber) {
      this.stopLoop(); // Clear any existing loop

      const phraseDuration = this.playPhrase(phraseNumber); // Play the phrase once
      this.loopInterval = setInterval(() => {
        this.playPhrase(phraseNumber);
      }, phraseDuration + 1000); // Add a pause between loops
    },
    stopLoop() {
      clearInterval(this.loopInterval);
    }
  },
  mounted() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  },
  beforeUnmount() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stopLoop();
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

.beacon-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.beacon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #111;
  transition: background-color 0.3s;
}
</style>
