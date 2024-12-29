import { app, Menu, dialog } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';
export function createApplicationMenu(mainWindow) {
    if (!mainWindow) {
        console.error('[Menu] Cannot create menu without a valid window reference');
        return;
    }
    console.log('[Menu] Creating application menu');
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        try {
                            console.log('[Menu] Open File clicked');
                            const result = await dialog.showOpenDialog(mainWindow, {
                                properties: ['openFile']
                            });
                            if (!result.canceled && result.filePaths.length > 0) {
                                const filePath = result.filePaths[0];
                                console.log('[Menu] Selected file:', filePath);
                                mainWindow.webContents.send(IPC_CHANNELS.FILE_OPEN, { filePath });
                            }
                        }
                        catch (error) {
                            console.error('[Menu] Error opening file:', error);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
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
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    console.log('[Menu] Application menu created successfully');
}
//# sourceMappingURL=menu.js.map