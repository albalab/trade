<template>
  <div class="meshbot-simulator">
    <!-- ===================== Параметры бота ===================== -->
    <div class="meshbot-section">
      <div
          class="meshbot-section-header"
          @click="toggleBlock('block1')"
      >
        <h2 class="title">
          <i v-if="visibilityState.block1" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Параметры реального бота {{ activeBot?.symbol || '' }}
        </h2>
      </div>
      <div class="section-settings" v-show="visibilityState.block1" v-if="activeBot">
        <div class="settings-grid">
          <div class="settings-block">
            Риск
            <label>
              <input
                  type="number"
                  v-model.number="activeBot.maxOpenTrades"
              />
              <span class="name">
                Лимит открытых позиций<br />
                (осталось {{ remainingBuyLimits }})
              </span>
            </label>

            <label>
              <input type="number" v-model.number="activeBot.volume" />
              <span class="name">Объём позиций</span>
            </label>
          </div>

          <div class="settings-block">
            Сетка
            <label>
              <input type="number" v-model.number="activeBot.levelsCount" />
              <span class="name">Число лимиток в пакете, шт</span>
            </label>

            <label>
              <input
                  type="number"
                  v-model.number="activeBot.gridStep"
                  step="0.1"
              />
              <span class="name">Шаг сетки, пункты</span>
            </label>

            <label>
              <input
                  type="number"
                  v-model.number="activeBot.takeProfitDistance"
                  step="0.1"
              />
              <span class="name">Тейк, пункты</span>
            </label>
          </div>

          <div class="settings-block">
            Улучшение сетки
            <label>
              <input
                  type="checkbox"
                  v-model="activeBot.enableRestore"
              />
              <span class="name">Включить восстановление лимиток</span>
            </label>

            <label>
              <input
                  type="number"
                  v-model.number="activeBot.restoreCount"
                  min="1"
              />
              <span class="name">Число восстанавливаемых лимиток</span>
            </label>

            <label>
              <input
                  type="checkbox"
                  v-model="activeBot.enableGridShift"
              />
              <span class="name">Включить смещение сетки</span>
            </label>

            <label>
              <input
                  type="checkbox"
                  v-model="activeBot.enableTpShift"
              />
              <span class="name">Включить смещение тейка</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== Блок Реальной торговли ===================== -->
    <div class="meshbot-section">
      <div
          class="meshbot-section-header"
          @click="toggleBlock('block2')"
      >
        <h2 class="title">
          <i v-if="visibilityState.block2" class="fal fa-chevron-down"></i>
          <i v-else class="fal fa-chevron-right"></i>
          Реальная торговля
        </h2>
      </div>

      <div v-if="visibilityState['block2']" style="padding: 10px;">
        Контекст бота:<br />
        MOEX → TQBR → D88123 → {{ activeBot?.symbol }}

        <div style="padding: 20px 0;">Расписание:</div>
        <button class="btn" @click="startRealTrading">Включить</button>
      </div>
    </div>

    <!-- ===================== Таблицы Buy/Sell/Trades ===================== -->
    <OrdersComponent
        v-if="activeBot"
        :buyLevels="activeBot.buyLevels"
        :sellOrders="activeBot.sellOrders"
        :openTrades="activeBot.openTrades"
    />

    <!-- ===================== История сделок ===================== -->
    <HistoryComponent
        v-if="activeBot"
        :closedTrades="activeBot.closedTrades"
        :totalProfit="activeBot.totalProfit"
    />

    <!-- ===================== Лог ===================== -->
    <LogComponent
        :logText="logText"
        :remainingRestoreCount="activeBot?.remainingRestoreCount || 0"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBotsStore } from "@/stores/botsStore";

// Импортируем методы торговли (REST)
import {
  getOrders,
  getPositions,
  sendLimitOrder,
  cancelGroupOrders,
  //cancelAllOrders
} from "@/modules/LimitOrderModule";

// Подключаем ваши компоненты
import OrdersComponent from "@/widgets/MeshBot/components/OrdersComponent.vue";
import HistoryComponent from "@/widgets/MeshBot/components/HistoryComponent.vue";
import LogComponent from "@/widgets/MeshBot/components/LogComponent.vue";

// 1) Подключаемся к Pinia-хранилищу
const botsStore = useBotsStore();

// 2) Получаем "активного" бота (объект из массива)
const activeBot = computed(() => botsStore.activeBot);

// Локальный лог
const logText = ref("");

// Для показа/скрытия аккордеонов
const visibilityState = ref({
  block1: true,
  block2: true,
  block3: true,
  block4: true,
  block5: true,
  block6: true,
});

// Пример, если нужно отслеживать "идёт ли реальная торговля"
const inProgress = ref(false);

// Сокеты (для ордеров и котировок), чтобы потом при остановке можно было закрыть
let ordersSocket = null;
let priceSocket = null;

/* ===================== Методы ===================== */

/** Сворачивать/разворачивать блоки */
function toggleBlock(blockId) {
  visibilityState.value[blockId] = !visibilityState.value[blockId];
}

/** Пример лог-функции */
function log(msg) {
  logText.value += msg + "\n";
  console.log(msg);
}

/** Подсчёт оставшихся «buy»-лимиток */
const remainingBuyLimits = computed(() => {
  if (!activeBot.value) return 0;
  const openTradesCount = activeBot.value.openTrades.length;
  return Math.max(activeBot.value.maxOpenTrades - openTradesCount, 0);
});

/* ==========================
   Запуск реальной торговли
   ========================== */
async function startRealTrading() {
  try {
    if (!activeBot.value) {
      log("Нет активного бота для запуска торговли");
      return;
    }
    log("Запуск реальной торговли...");

    // 1. Инициализируем (синхронизация лимиток и позиций)
    await initBotLogic();

    // 2. Подключаемся к WebSocket ордеров
    connectToOrdersWebSocket();

    // 3. Подписываемся на цены (WebSocket котировок)
    connectToPriceFeed();

    // 4. Помечаем, что бот торгует
    activeBot.value.isTradingActive = true;
    inProgress.value = true;

    log("Реальная торговля запущена");
  } catch (err) {
    log("Ошибка запуска торговли: " + err.message);
  }
}

/**
 * initBotLogic: пример синхронизации.
 *  1) Получаем ордера
 *  2) Удаляем «зомби»
 *  3) Выставляем недостающие
 *  4) Загружаем позиции (опционально)
 */
async function initBotLogic() {
  if (!activeBot.value) {
    log("initBotLogic: Нет activeBot");
    return;
  }
  try {
    log("== initBotLogic: синхронизируем лимитки... ==");

    // (а) Загружаем все ордера
    const allOrders = await getOrders("MOEX", "D88123", "Simple");
    log(`Получено ордеров: ${allOrders.length}`);

    const working = allOrders.filter(o => o.status === "working");
    log(`"working": ${working.length}`);

    // (б) "Зомби"-ордера: те, которых нет в myLimitOrdersIds
    for (const o of working) {
      const orderId = o.orderNumber || o.id;
      if (!activeBot.value.myLimitOrdersIds.includes(orderId)) {
        log(`Найден зомби #${orderId}, отменяем...`);
        await cancelGroupOrders({
          orderIds: [orderId],
          portfolio: "D88123",
          exchange: "MOEX",
          stop: false
        });
      }
    }

    // (в) Выставить недостающие BUY
    await placeMissingBuyOrders();

    // (г) Выставить недостающие SELL
    await placeMissingSellOrders();

    // (д) Получаем позиции (если нужно)
    const positions = await getPositions("MOEX", "D88123", "Simple", false);
    log(`Позиции получены: ${positions.length}`);

    log("== initBotLogic: готово ==");
  } catch (err) {
    log("Ошибка initBotLogic: " + err.message);
  }
}

/** Выставляем Buy-ордера для buyLevels, где нет orderId */
async function placeMissingBuyOrders() {
  if (!activeBot.value) return;
  for (const level of activeBot.value.buyLevels) {
    if (!level.orderId) {
      log(`Выставляем BUY @${level.price}`);
      try {
        const resp = await sendLimitOrder(
            level.volume,
            level.price,
            activeBot.value.symbol,
            "MOEX",
            "buy",
            "D88123"
        );
        if (resp.success && resp.data) {
          const newId = resp.data.id || resp.data.orderNumber;
          level.orderId = newId;
          // Добавляем в список "моих" ордеров, если ещё нет
          if (!activeBot.value.myLimitOrdersIds.includes(newId)) {
            activeBot.value.myLimitOrdersIds.push(newId);
          }
          log(`BUY создан: id=${newId}`);
        } else {
          log("Не удалось выставить BUY (resp.success=false?)");
        }
      } catch (e) {
        log("Ошибка при BUY: " + e.message);
      }
    }
  }
}

/** Аналогично выставляем Sell-ордера */
async function placeMissingSellOrders() {
  if (!activeBot.value) return;
  for (const so of activeBot.value.sellOrders) {
    if (!so.orderId) {
      log(`Выставляем SELL @${so.price}`);
      try {
        const resp = await sendLimitOrder(
            so.volume,
            so.price,
            activeBot.value.symbol,
            "MOEX",
            "sell",
            "D88123"
        );
        if (resp.success && resp.data) {
          const newId = resp.data.id || resp.data.orderNumber;
          so.orderId = newId;
          if (!activeBot.value.myLimitOrdersIds.includes(newId)) {
            activeBot.value.myLimitOrdersIds.push(newId);
          }
          log(`SELL создан: id=${newId}`);
        } else {
          log("Не удалось выставить SELL (resp.success=false?)");
        }
      } catch (e) {
        log("Ошибка при SELL: " + e.message);
      }
    }
  }
}

/* =======================================
   Подключение к WebSocket ордеров
   ======================================= */
function connectToOrdersWebSocket() {
  // Если уже подключены, закрываем старый сокет
  if (ordersSocket) {
    try { ordersSocket.close(); } catch {
      console.log('Close old socket error');
    }
  }
  ordersSocket = new WebSocket("wss://signalfabric.com/orders/");

  ordersSocket.onopen = () => {
    log("Orders WebSocket: connected");
  };
  ordersSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Ожидаем формат { data: { id, status, symbol, ... } }
      if (!data?.data) return;

      const { id, status } = data.data;
      // Проверяем, наш ли это ордер
      if (!activeBot.value || !activeBot.value.myLimitOrdersIds.includes(id)) {
        // Не наш ордер => игнорируем
        return;
      }

      // Либо можно логировать
      log(`WS order event: #${id}, status=${status}`);

      // Если статус "filled" — убираем из buyLevels / sellOrders
      if (status === "filled") {
        // Ищем в buyLevels
        for (const bl of activeBot.value.buyLevels) {
          if (bl.orderId === id) {
            bl.orderId = null; // Или splice, если хотите удалить
            // ...
          }
        }
        // Аналогично sellOrders
        for (const so of activeBot.value.sellOrders) {
          if (so.orderId === id) {
            so.orderId = null;
          }
        }
        // Плюс логика увеличения openTrades / closedTrades, если надо
      }
      else if (status === "canceled") {
        // Если был отменён, убираем orderId
        for (const bl of activeBot.value.buyLevels) {
          if (bl.orderId === id) {
            bl.orderId = null;
          }
        }
        for (const so of activeBot.value.sellOrders) {
          if (so.orderId === id) {
            so.orderId = null;
          }
        }
        // И убираем его из myLimitOrdersIds
        activeBot.value.myLimitOrdersIds = activeBot.value.myLimitOrdersIds.filter(x => x !== id);
      }
      else if (status === "working") {
        // Можно обновить цену, кол-во, если пришли (data.data.price, volume)
      }
    } catch (err) {
      log("WS orders onmessage error: " + err.message);
    }
  };
  ordersSocket.onerror = (err) => {
    log("Orders WebSocket error: " + err);
  };
  ordersSocket.onclose = () => {
    log("Orders WebSocket closed");
  };
}

/* ================================
   Подключение к котировкам (цена)
   ================================ */
function connectToPriceFeed() {
  // Если уже подключены, закрываем
  if (priceSocket) {
    try { priceSocket.close(); } catch {
      console.log('Close error');
    }
  }
  priceSocket = new WebSocket("wss://signalfabric.com/quotes/");

  priceSocket.onopen = () => {
    log("PriceFeed WebSocket: connected");
    // Иногда нужно отправить запрос на подписку
    // priceSocket.send(JSON.stringify({ action: "subscribe", symbol: activeBot.value.symbol }));
  };

  priceSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Ожидаем формат { symbol: "SBER", price: 123.45, ... }
      if (!activeBot.value) return;
      if (data?.symbol === activeBot.value.symbol && data?.price) {
        activeBot.value.currentPrice = data.price;
        // При изменении цены вы можете проверить исполнение (или просто дожидаться WS orders)
        // checkBuyOrders(); checkSellOrders(); ...
      }
    } catch (err) {
      log("WS priceFeed onmessage error: " + err.message);
    }
  };

  priceSocket.onerror = (err) => {
    log("PriceFeed WebSocket error: " + err);
  };

  priceSocket.onclose = () => {
    log("PriceFeed WebSocket closed");
  };
}
</script>

<style>
.meshbot-simulator {
  font-family: sans-serif;
}

/* Стили, как у вас в примере */
.meshbot-section {
  margin-bottom: 10px;
}
.meshbot-section-header {
  cursor: pointer;
  padding: 6px 10px;
}
.settings-grid {
  display: flex;
  gap: 10px;
}
.settings-block {
  flex: 1;
  padding: 8px;
}
.settings-block label {
  display: block;
  margin-bottom: 6px;
}
.settings-block .name {
  margin-left: 6px;
  font-size: 0.9em;
  color: #666;
}

.btn {
  padding: 4px 10px;
  margin-right: 10px;
  background: #ddd;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
