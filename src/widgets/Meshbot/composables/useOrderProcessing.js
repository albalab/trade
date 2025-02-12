// useOrderProcessing.js
import { watch } from 'vue';

export function useOrderProcessing({ bot, ordersStore, meshbotStore, settings }) {
    /**
     * Функция для обработки обновлений ордеров.
     * Принимает новые ордера и, если ордер для данного бота выполнен, обновляет:
     * - Удаляет соответствующие линии.
     * - Добавляет точки на график.
     * - Формирует новый уровень тейка и отправляет лимитный ордер на продажу.
     */
    const processOrders = () => {
        watch(
            () => ordersStore.limitOrders,
            (newOrders) => {
                newOrders.forEach(order => {
                    if (order.data.botId === bot.name) {
                        const orderPrice = Number((order.data.price * 100).toFixed(0));
                        if (order.data._setted) return;

                        // Обработка заполненного buy-ордера
                        if (order.data.side === 'buy' && order.data.status === 'filled') {
                            console.log(`Buy order filled at ${orderPrice}`);

                            order.data._setted = true;

                            // Удаляем линию BUY
                            meshbotStore.removeLine(bot.name, "BUY_" + orderPrice);
                            // Добавляем точку на графике
                            settings.buyPoints.push({ x: settings.timeIndex, y: orderPrice });

                            // Рассчитываем цену тейк-профита
                            const profitPriceLevel = orderPrice + settings.takeProfitDistance;

                            // Регистрируем уровень тейка
                            settings.profitLevels.push({
                                price: profitPriceLevel,
                                volume: settings.volume,
                                linkBuy: orderPrice
                            });

                            // Рисуем SELL-линию на графике
                            settings.linesData.push({
                                id: "SELL_" + profitPriceLevel,
                                price: profitPriceLevel,
                                color: "rgba(255,183,77,0.7)"
                            });

                            // Переводим цену из пунктов в «рыночное» значение
                            const profitPrice = parseFloat((profitPriceLevel / 100).toFixed(2));
                            console.log('Send limit order from bot: ', bot.name, profitPrice);

                            // Отправляем лимитный ордер на продажу
                            ordersStore.sendLimitOrder(
                                settings.volume,
                                profitPrice,
                                order.data.ticker,
                                'MOEX',
                                'sell', // направление – продажа
                                'D88141',
                                bot.name
                            );
                        }

                        // Обработка заполненного sell-ордера
                        if (order.data.side === 'sell' && order.data.status === 'filled') {
                            console.log(`Sell order filled at ${orderPrice}`);

                            order.data._setted = true;

                            // Удаляем SELL-линию
                            meshbotStore.removeLine(bot.name, "SELL_" + orderPrice);


                            // Регистрируем точку продажи
                            //settings.sellPoints.push({ x: settings.timeIndex, y: orderPrice });

                            meshbotStore.addSellPoint(bot.name, {
                                x: bot.settings.timeIndex,
                                y: orderPrice
                            });
                        }
                    }
                });
            },
            { deep: true }
        );
    };

    return { processOrders };
}
