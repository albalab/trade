// initWidgets.js
export const initWidgets = async () => {
    const { addCustomMenuItem, observeMenuChanges } = await import('https://trade-6rl.pages.dev/trade-scripts/menuManager.js');
    const { createWidget, initializeIframes } = await import('https://trade-6rl.pages.dev/trade-scripts/widgetManager.js');

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
        },
        {
            widgetName: 'Alor Orderbooks', // Название виджета
            localStorageKey: 'albalab_alor_orderbooks', // Ключ для хранения в localStorage
            iframeUrl: 'https://trade-6rl.pages.dev/#/alororderbooks' // URL для iframe
        },
    ];

    observeMenuChanges(widgetsConfig, addCustomMenuItem, createWidget); // Передаем createCandlesWidget
    initializeIframes(widgetsConfig); // Инициализация iframe
};

// Асинхронный вызов initWidgets с ожиданием
(async () => {
    await initWidgets();
})();
