"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('🔌 Preload script starting...');
const electron_1 = require("electron");
console.log('[Preload] Starting preload script');
// Verify that we have access to electron APIs
if (!electron_1.ipcRenderer) {
    console.error('[Preload] No ipcRenderer available!');
    throw new Error('ipcRenderer not available in preload');
}
try {
    // Create the API object
    const electronAPI = {
        ipcRenderer: {
            send: (channel, message) => {
                console.log('[Preload] send:', channel, message);
                electron_1.ipcRenderer.send(channel, message);
            },
            invoke: async (channel, message) => {
                console.log('[Preload] invoke:', channel, message);
                const result = await electron_1.ipcRenderer.invoke(channel, message);
                console.log('[Preload] invoke result:', result);
                return result;
            },
            on: (channel, callback) => {
                console.log('[Preload] Adding listener for:', channel);
                const handler = (_event, message) => {
                    console.log('[Preload] Received:', channel, message);
                    callback(message);
                };
                electron_1.ipcRenderer.on(channel, handler);
            },
            once: (channel, callback) => {
                const handler = (_event, message) => {
                    console.log('[Preload] Received once:', channel, message);
                    callback(message);
                };
                electron_1.ipcRenderer.once(channel, handler);
            },
            removeListener: (channel, callback) => {
                electron_1.ipcRenderer.removeListener(channel, callback);
            },
            removeAllListeners: (channel) => {
                electron_1.ipcRenderer.removeAllListeners(channel);
            }
        }
    };
    // Expose the API to the renderer process
    console.log('[Preload] Exposing electron API to window');
    electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
    console.log('[Preload] Preload script complete');
}
catch (error) {
    console.error('[Preload] Error in preload script:', error);
    throw error; // Re-throw to make sure the error is visible
}
//# sourceMappingURL=index.js.map