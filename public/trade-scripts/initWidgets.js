// initWidgets.js
export const initWidgets = async () => {
    const { addCustomMenuItem } = await import('https://trade-6rl.pages.dev/trade-scripts/menuManager.js');
    const { createCandlesWidget } = await import('https://trade-6rl.pages.dev/trade-scripts/widgetManager.js');

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

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            widgetsConfig.forEach(widgetConfig => {
                addCustomMenuItem(widgetConfig, createCandlesWidget);
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Добавляем логику вставки iframe и отправки сообщений
    setTimeout(() => {
        widgetsConfig.forEach(widgetConfig => {
            let widgets = localStorage.getItem(widgetConfig.localStorageKey);
            if (widgets) {
                try {
                    widgets = JSON.parse(widgets);
                    widgets.forEach(widgetId => {
                        let elements = document.querySelectorAll(`[data-widget-id="${widgetId}"]`);
                        elements.forEach(element => {
                            let widgetBlock = element.querySelector('.widget');
                            if (widgetBlock) {
                                widgetBlock.innerHTML = `<iframe src="${widgetConfig.iframeUrl}" style="width: 100%; height: 100%;" class="custom-iframe"></iframe>`;
                                let iframe = widgetBlock.querySelector('iframe.custom-iframe');
                                if (iframe) {
                                    function sendMessage() {
                                        const message = { time: new Date().toISOString(), data: "Your message here" };
                                        iframe.contentWindow.postMessage(message, '*');
                                    }
                                    setInterval(sendMessage, 10000); // 10 секунд
                                }
                            }
                        });
                    });
                } catch (e) {
                    console.error(`Ошибка при обработке ${widgetConfig.localStorageKey}:`, e);
                }
            }
        });
    }, 10000); // Задержка в 10 секунд
};

// Асинхронный вызов initWidgets с ожиданием
(async () => {
    await initWidgets();
})();
