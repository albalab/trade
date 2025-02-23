
const { contextBridge, ipcRenderer } = require('electron')


// Методы инициализированные для фронта, именно их фронт будет использовать для отправки данных основному процессу ipcMain
// Другими словами - Экспонирование API в глобальное пространство рендерера
contextBridge.exposeInMainWorld('electronAPI', {

    resizeWindow: (width, height) => ipcRenderer.send('electron-resize-window', { width, height }),

    // Октрытие окна из main-процесса
    openPopup: () => ipcRenderer.send('electron-open-popup'),

    // Подписка на поток данных из основного процесса
    onWebSocketData: (callback) => ipcRenderer.on('electron-ws-data', callback),

    // Отправляет данные на канал 'electron-ws-data' в главный процесс.
    sendWebSocketData: (data) => ipcRenderer.send('electron-ws-data', data),

    // Удаление подписки на поток данных из основного процесса
    removeWebSocketDataListener: (callback) => ipcRenderer.removeListener('electron-ws-data', callback),

})
