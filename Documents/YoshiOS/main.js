const { app, BrowserWindow } = require('electron');
const path = require('path');
const mqtt = require('mqtt');

let mainWindow, mqttClient;
const CERBO_IP = '192.168.1.100';
const CERBO_PORT = 1883;
const PORTAL_ID = 'YOUR_PORTAL_ID';

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, backgroundColor: '#000000', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.loadFile('index.html');
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') mainWindow.webContents.toggleDevTools();
    if (input.key === 'Escape') app.quit();
  });
}

function connectMQTT() {
  mqttClient = mqtt.connect(`mqtt://${CERBO_IP}:${CERBO_PORT}`, { reconnectPeriod: 5000, connectTimeout: 10000 });
  mqttClient.on('connect', () => {
    mainWindow.webContents.send('mqtt-status', 'connected');
    mqttClient.subscribe(`N/${PORTAL_ID}/#`);
    setInterval(() => mqttClient.publish(`R/${PORTAL_ID}/keepalive`, ''), 25000);
  });
  mqttClient.on('message', (topic, message) => {
    try { const v = JSON.parse(message.toString()); mainWindow.webContents.send('mqtt-data', { topic, value: v.value }); } catch(e) {}
  });
  mqttClient.on('error', () => mainWindow.webContents.send('mqtt-status', 'simulated'));
  mqttClient.on('offline', () => mainWindow.webContents.send('mqtt-status', 'simulated'));
}

app.whenReady().then(() => { createWindow(); connectMQTT(); });
app.on('window-all-closed', () => app.quit());
