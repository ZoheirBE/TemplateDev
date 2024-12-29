import { app, BrowserWindow, session } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { setupIpcHandlers } from './ipcHandlers';
import { createApplicationMenu } from './menu';

console.log('[STARTUP] Main process starting');
console.log('[STARTUP] Process ID:', process.pid);
console.log('[STARTUP] Parent Process ID:', process.ppid);
console.log('[STARTUP] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
});

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

// Set up IPC handlers before creating any windows
setupIpcHandlers();

const createWindow = () => {
  console.log('[Main] Creating window');
  console.log('[Main] Environment:', process.env.NODE_ENV);
  console.log('[Main] __dirname:', __dirname);
  
  // Set up CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net data: blob:;"
        ]
      }
    });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  });

  if (isDev) {
    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools();
    }
  } else {
    // Load the index.html from the dist folder
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Create application menu
  createApplicationMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
