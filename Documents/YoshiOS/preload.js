const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('yoshios', {
  onMqttData: (callback) => ipcRenderer.on('mqtt-data', (_, data) => callback(data)),
  onMqttStatus: (callback) => ipcRenderer.on('mqtt-status', (_, status) => callback(status))
});
