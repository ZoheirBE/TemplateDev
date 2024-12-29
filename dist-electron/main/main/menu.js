"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicationMenu = createApplicationMenu;
const electron_1 = require("electron");
const ipc_1 = require("../shared/ipc");
function createApplicationMenu(mainWindow) {
    console.log('[Menu] Creating application menu');
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (!mainWindow)
                            return;
                        console.log('[Menu] Sending new-file event');
                        mainWindow.webContents.send('menu:new-file');
                    }
                },
                {
                    label: 'Open...',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        if (!mainWindow) {
                            console.error('[Menu] No main window available');
                            return;
                        }
                        try {
                            console.log('[Menu] Opening file dialog');
                            const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                                properties: ['openFile'],
                                filters: [{ name: 'XML Files', extensions: ['xml'] }]
                            });
                            if (!result.canceled && result.filePaths.length > 0) {
                                const message = {
                                    filePath: result.filePaths[0]
                                };
                                console.log('[Menu] Selected file:', message);
                                mainWindow.webContents.send(ipc_1.IPC_CHANNELS.FILE.OPEN, message);
                            }
                        }
                        catch (error) {
                            console.error('[Menu] Error in open file handler:', error);
                        }
                    }
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        if (!mainWindow)
                            return;
                        console.log('[Menu] Sending save-file event');
                        mainWindow.webContents.send('menu:save-file');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click: () => {
                        electron_1.app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
    console.log('[Menu] Application menu created');
}
//# sourceMappingURL=menu.js.map