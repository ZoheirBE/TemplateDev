console.log('🔌 Preload script starting...');
// @ts-ignore
import { contextBridge, ipcRenderer } from 'electron';
console.log('[Preload] Starting preload script');
// Check if we're in a renderer process
if (!process.type) {
    console.log('[Preload] Not in a renderer process');
    process.exit(1);
}
const init = () => {
    try {
        // Expose protected methods that allow the renderer process to use
        // the ipcRenderer without exposing the entire object
        contextBridge.exposeInMainWorld('electron', {
            ipcRenderer: {
                send: (channel, data) => {
                    console.log('[Preload] Sending on channel:', channel, data);
                    ipcRenderer.send(channel, data);
                },
                on: (channel, func) => {
                    console.log('[Preload] Registering listener for channel:', channel);
                    // Deliberately strip event as it includes `sender` 
                    ipcRenderer.on(channel, (event, ...args) => func(...args));
                },
                invoke: async (channel, data) => {
                    console.log('[Preload] Invoking on channel:', channel, data);
                    return await ipcRenderer.invoke(channel, data);
                },
                removeListener: (channel, func) => {
                    console.log('[Preload] Removing listener for channel:', channel);
                    ipcRenderer.removeListener(channel, func);
                },
                removeAllListeners: (channel) => {
                    console.log('[Preload] Removing all listeners for channel:', channel);
                    ipcRenderer.removeAllListeners(channel);
                }
            }
        });
        console.log('[Preload] API exposed successfully');
    }
    catch (error) {
        console.error('[Preload] Error initializing:', error);
    }
};
// Initialize immediately
init();
//# sourceMappingURL=index.js.map