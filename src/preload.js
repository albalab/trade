
const { contextBridge, ipcRenderer } = require('electron')

const wsDataListener = (callback) => {
    ipcRenderer.on('ws-data', callback);
};

const removeWsDataListener = (callback) => {
    ipcRenderer.removeListener('ws-data', callback);
};

contextBridge.exposeInMainWorld('electronAPI', {

    resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),

    openPopup: () => ipcRenderer.send('open-popup'),

    sendWebSocketData: (data) => ipcRenderer.send('ws-data', data),
    onWebSocketData: wsDataListener,
    removeWebSocketDataListener: removeWsDataListener,
    /*// Отправка данных из главного окна в main-процесс
    sendWebSocketData: (data) => ipcRenderer.send('ws-data', data),
    // Подписка на поток данных в попапе
    onWebSocketData: (callback) => ipcRenderer.on('ws-data', callback),
*/
})
