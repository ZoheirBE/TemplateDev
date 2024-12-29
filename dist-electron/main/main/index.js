"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const ipcHandlers_1 = require("./ipcHandlers");
const menu_1 = require("./menu");
console.log('[STARTUP] Main process starting');
console.log('[STARTUP] Process ID:', process.pid);
console.log('[STARTUP] Parent Process ID:', process.ppid);
console.log('[STARTUP] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
    ELECTRON_IS_DEV: process.env.ELECTRON_IS_DEV,
});
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';
const rendererPort = isDev ? 3000 : undefined;
const createWindow = () => {
    console.log('[Main] Creating window');
    console.log('[Main] Environment:', process.env.NODE_ENV);
    console.log('[Main] Renderer port:', rendererPort);
    console.log('[Main] __dirname:', __dirname);
    // Set up CSP
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net data: blob:;"
                ]
            }
        });
    });
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Required for IPC to work
            preload: (0, path_1.join)(__dirname, '..', 'preload', 'index.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
    });
    // Set up IPC handlers before creating the window
    (0, ipcHandlers_1.setupIpcHandlers)();
    // Log preload script path
    const preloadPath = (0, path_1.join)(__dirname, '..', 'preload', 'index.js');
    console.log('[Main] Preload script path:', preloadPath);
    console.log('[Main] Preload script exists:', require('fs').existsSync(preloadPath));
    if (isDev) {
        console.log('[Main] Loading development URL');
        const url = `http://localhost:${rendererPort}`;
        console.log('[Main] Development URL:', url);
        // Listen for console messages from the renderer
        mainWindow.webContents.on('console-message', (event, level, message) => {
            console.log('[Renderer Console]:', message);
        });
        mainWindow.loadURL(url).catch((err) => {
            console.error('[Main] Failed to load development URL:', err);
        });
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('[Main] Loading production file');
        const filePath = (0, path_1.join)(__dirname, '..', 'renderer', 'index.html');
        console.log('[Main] Production file path:', filePath);
        mainWindow.loadFile(filePath).catch((err) => {
            console.error('[Main] Failed to load production file:', err);
        });
    }
    // Create application menu after window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow)
            return;
        console.log('[Main] Window loaded, creating menu');
        (0, menu_1.createApplicationMenu)(mainWindow);
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    return mainWindow;
};
const main = async () => {
    console.log('[STARTUP] Entering main function');
    try {
        // Prevent multiple instances in production only
        if (!isDev) {
            const gotTheLock = electron_1.app.requestSingleInstanceLock();
            if (!gotTheLock) {
                console.log('[Main] Another instance is already running');
                electron_1.app.quit();
                return;
            }
        }
        await electron_1.app.whenReady();
        console.log('[Main] App is ready');
        // Create initial menu
        (0, menu_1.createApplicationMenu)();
        const window = createWindow();
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', () => {
            if (mainWindow === null) {
                createWindow();
            }
        });
    }
    catch (error) {
        console.error('[Main] Error in main process:', error);
        electron_1.app.quit();
    }
};
main();
//# sourceMappingURL=index.js.map