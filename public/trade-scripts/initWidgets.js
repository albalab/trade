// initWidgets.js
export const initWidgets = async () => {
    const { addCustomMenuItem, observeMenuChanges } = await import('https://trade-6rl.pages.dev/trade-scripts/menuManager.js');
    const { createCandlesWidget, initializeIframes } = await import('https://trade-6rl.pages.dev/trade-scripts/widgetManager.js');

    const widgetsConfig = [
        {
            widgetName: 'Alor Candles',
            localStorageKey: 'albalab_widgets_1',
            iframeUrl: 'https://trade-6rl.pages.dev/#/alorcandles'
        },
        {
            widgetName: 'Alor Trades',
            localStorageKey: 'albalab_alor_trades',
            iframeUrl: 'https://trade-6rl.pages.dev/#/alortrades'
        },
        {
            widgetName: 'Robot1',
            localStorageKey: 'albalab_robot_1',
            iframeUrl: 'https://trade-6rl.pages.dev/#/alortrades'
        }
    ];

    observeMenuChanges(widgetsConfig, addCustomMenuItem, createCandlesWidget); // Передаем createCandlesWidget
    initializeIframes(widgetsConfig); // Инициализация iframe
};

// Асинхронный вызов initWidgets с ожиданием
(async () => {
    await initWidgets();
})();
