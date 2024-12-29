"use strict";
const electron = require("electron");
console.log("🔌 Preload script starting...");
console.log("[Preload] Starting preload script");
if (!electron.ipcRenderer) {
  console.error("[Preload] No ipcRenderer available!");
  throw new Error("ipcRenderer not available in preload");
}
try {
  const electronAPI = {
    ipcRenderer: {
      send: (channel, message) => {
        console.log("[Preload] send:", channel, message);
        electron.ipcRenderer.send(channel, message);
      },
      invoke: async (channel, message) => {
        console.log("[Preload] invoke:", channel, message);
        const result = await electron.ipcRenderer.invoke(channel, message);
        console.log("[Preload] invoke result:", result);
        return result;
      },
      on: (channel, callback) => {
        console.log("[Preload] Adding listener for:", channel);
        const handler = (_event, message) => {
          console.log("[Preload] Received:", channel, message);
          callback(message);
        };
        electron.ipcRenderer.on(channel, handler);
      },
      once: (channel, callback) => {
        const handler = (_event, message) => {
          console.log("[Preload] Received once:", channel, message);
          callback(message);
        };
        electron.ipcRenderer.once(channel, handler);
      },
      removeListener: (channel, callback) => {
        electron.ipcRenderer.removeListener(channel, callback);
      },
      removeAllListeners: (channel) => {
        electron.ipcRenderer.removeAllListeners(channel);
      }
    }
  };
  console.log("[Preload] Exposing electron API to window");
  electron.contextBridge.exposeInMainWorld("electron", electronAPI);
  console.log("[Preload] Preload script complete");
} catch (error) {
  console.error("[Preload] Error in preload script:", error);
  throw error;
}
//# sourceMappingURL=index.js.map
