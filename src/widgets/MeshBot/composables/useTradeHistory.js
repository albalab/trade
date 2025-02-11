export function useTradeHistory() {
    const trimTradeHistory = (tradeHistory, displayMode, latestWindowSize) => {
        if (displayMode === 'latest' && tradeHistory.priceData.length > latestWindowSize) {
            // Удаляем из начала массива столько элементов, чтобы осталось latestWindowSize
            tradeHistory.priceData.splice(0, tradeHistory.priceData.length - latestWindowSize);

            // Определяем минимальное значение x в оставшейся истории
            const earliestX = tradeHistory.priceData[0].x;

            // Фильтруем buyPoints и sellPoints, оставляя только точки с x >= earliestX
            tradeHistory.buyPoints = tradeHistory.buyPoints.filter(bp => bp.x >= earliestX);
            tradeHistory.sellPoints = tradeHistory.sellPoints.filter(sp => sp.x >= earliestX);
        }
    };

    return { trimTradeHistory };
}
