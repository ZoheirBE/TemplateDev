"use strict";
const electron = require("electron");
console.log("🔌 Preload script starting...");
console.log("🔌 Setting up IPC bridge...");
try {
  electron.contextBridge.exposeInMainWorld(
    "electron",
    {
      ipcRenderer: {
        send: (channel, data) => {
          console.log("🔌 [Preload] Sending on channel:", channel, data);
          try {
            electron.ipcRenderer.send(channel, data);
          } catch (error) {
            console.error("🔌 [Preload] Error sending message:", error);
          }
        },
        on: (channel, func) => {
          console.log("🔌 [Preload] Setting up listener for channel:", channel);
          try {
            electron.ipcRenderer.on(channel, (event, ...args) => {
              console.log("🔌 [Preload] Received on channel:", channel, args);
              try {
                func(...args);
              } catch (error) {
                console.error("🔌 [Preload] Error in listener callback:", error);
              }
            });
          } catch (error) {
            console.error("🔌 [Preload] Error setting up listener:", error);
          }
        },
        invoke: async (channel, ...args) => {
          console.log("🔌 [Preload] Invoking channel:", channel, args);
          try {
            const result = await electron.ipcRenderer.invoke(channel, ...args);
            console.log("🔌 [Preload] Invoke result:", channel, result);
            return result;
          } catch (error) {
            console.error("🔌 [Preload] Error invoking channel:", error);
            throw error;
          }
        }
      }
    }
  );
  console.log("🔌 Preload script complete!");
} catch (error) {
  console.error("🔌 [Preload] Critical error in preload script:", error);
}
