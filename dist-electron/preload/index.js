"use strict";
const electron = require("electron");
console.log("🔌 Preload script starting...");
console.log("[Preload] Starting preload script");
if (!process.type) {
  console.log("[Preload] Not in a renderer process");
  process.exit(1);
}
const init = () => {
  try {
    electron.contextBridge.exposeInMainWorld("electron", {
      ipcRenderer: {
        send: (channel, data) => {
          console.log("[Preload] Sending on channel:", channel, data);
          electron.ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
          console.log("[Preload] Registering listener for channel:", channel);
          electron.ipcRenderer.on(channel, (event, ...args) => func(...args));
        },
        invoke: async (channel, data) => {
          console.log("[Preload] Invoking on channel:", channel, data);
          return await electron.ipcRenderer.invoke(channel, data);
        },
        removeListener: (channel, func) => {
          console.log("[Preload] Removing listener for channel:", channel);
          electron.ipcRenderer.removeListener(channel, func);
        },
        removeAllListeners: (channel) => {
          console.log("[Preload] Removing all listeners for channel:", channel);
          electron.ipcRenderer.removeAllListeners(channel);
        }
      }
    });
    console.log("[Preload] API exposed successfully");
  } catch (error) {
    console.error("[Preload] Error initializing:", error);
  }
};
init();
//# sourceMappingURL=index.js.map
