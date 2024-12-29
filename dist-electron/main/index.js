"use strict";
const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const IPC_CHANNELS = {
  FILE_OPEN: "file:open",
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_CHANGED: "file:changed",
  FILE_DELETED: "file:deleted",
  FILE_ERROR: "file:error",
  TEST_IPC: "test:ipc",
  TEST_IPC_REPLY: "test:ipc:reply"
};
function setupIpcHandlers() {
  console.log("[IPC] Setting up IPC handlers");
  electron.ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, message) => {
    try {
      console.log("[IPC] Reading file:", message);
      if (!(message == null ? void 0 : message.filePath)) {
        throw new Error("No file path provided");
      }
      const content = await fs.promises.readFile(message.filePath, "utf-8");
      console.log("[IPC] File read successfully, length:", content.length);
      return { content };
    } catch (err) {
      console.error("[IPC] Error reading file:", err);
      const error = err instanceof Error ? err.message : "Unknown error occurred";
      return {
        content: "",
        error
      };
    }
  });
  electron.ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (event, message) => {
    try {
      console.log("[IPC] Writing file:", message);
      if (!(message == null ? void 0 : message.filePath)) {
        throw new Error("No file path provided");
      }
      await fs.promises.writeFile(message.filePath, message.content, "utf-8");
      console.log("[IPC] File written successfully");
      return { success: true };
    } catch (err) {
      console.error("[IPC] Error writing file:", err);
      const error = err instanceof Error ? err.message : "Unknown error occurred";
      return {
        success: false,
        error
      };
    }
  });
  electron.ipcMain.on(IPC_CHANNELS.FILE_ERROR, (event, message) => {
    console.error("[IPC] File error:", message);
  });
  electron.ipcMain.on(IPC_CHANNELS.TEST_IPC, (event, arg) => {
    console.log("[IPC] Received test message:", arg);
    event.reply(IPC_CHANNELS.TEST_IPC_REPLY, "IPC connection working");
  });
  electron.ipcMain.on(IPC_CHANNELS.FILE_CHANGED, (event, filePath) => {
    console.log("[IPC] File changed:", filePath);
    event.sender.send(IPC_CHANNELS.FILE_CHANGED, filePath);
  });
  electron.ipcMain.on(IPC_CHANNELS.FILE_DELETED, (event, filePath) => {
    console.log("[IPC] File deleted:", filePath);
    event.sender.send(IPC_CHANNELS.FILE_DELETED, filePath);
  });
}
function createApplicationMenu(mainWindow2) {
  if (!mainWindow2) {
    console.error("[Menu] Cannot create menu without a valid window reference");
    return;
  }
  console.log("[Menu] Creating application menu");
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            try {
              console.log("[Menu] Open File clicked");
              const result = await electron.dialog.showOpenDialog(mainWindow2, {
                properties: ["openFile"]
              });
              if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                console.log("[Menu] Selected file:", filePath);
                mainWindow2.webContents.send(IPC_CHANNELS.FILE_OPEN, { filePath });
              }
            } catch (error) {
              console.error("[Menu] Error opening file:", error);
            }
          }
        },
        { type: "separator" },
        {
          label: "Exit",
          click: () => {
            electron.app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
  console.log("[Menu] Application menu created successfully");
}
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("index.js", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
console.log("[STARTUP] Main process starting");
console.log("[STARTUP] Process ID:", process.pid);
console.log("[STARTUP] Parent Process ID:", process.ppid);
console.log("[STARTUP] Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL
});
let mainWindow = null;
const isDev = process.env.NODE_ENV === "development";
setupIpcHandlers();
const createWindow = () => {
  console.log("[Main] Creating window");
  console.log("[Main] Environment:", process.env.NODE_ENV);
  console.log("[Main] __dirname:", __dirname$1);
  electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net data: blob:;"
        ]
      }
    });
  });
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname$1, "../preload/index.js")
    }
  });
  if (isDev) {
    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../renderer/index.html"));
  }
  createApplicationMenu(mainWindow);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
//# sourceMappingURL=index.js.map
