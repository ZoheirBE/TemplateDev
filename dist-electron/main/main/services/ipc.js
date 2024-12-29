"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = void 0;
const electron_1 = require("electron");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const electron_store_1 = __importDefault(require("electron-store"));
const store = new electron_store_1.default();
const LOG_FILE = (0, path_1.join)(electron_1.app.getPath('userData'), 'XMLEditor', 'error.log');
const setupIpcHandlers = () => {
    console.log('[IPC Main] Setting up IPC handlers');
    // Test IPC connection
    electron_1.ipcMain.on('test-ipc', (event, arg) => {
        console.log('[IPC Main] Received test message:', arg);
        event.reply('test-ipc-reply', 'IPC connection working');
    });
    // File operations
    electron_1.ipcMain.handle('file:read', async (_, filePath) => {
        console.log('[IPC Main] Reading file:', JSON.stringify(filePath));
        console.log('[IPC Main] File path type:', typeof filePath);
        try {
            console.log('[IPC Main] Reading file:', filePath);
            // Check if file exists first
            try {
                await (0, promises_1.access)(filePath);
            }
            catch (error) {
                console.error('[IPC Main] File does not exist:', filePath);
                throw new Error(`File does not exist: ${filePath}`);
            }
            const content = await (0, promises_1.readFile)(filePath, 'utf-8');
            console.log('[IPC Main] File read successfully, content length:', content.length);
            return content;
        }
        catch (error) {
            console.error('[IPC Main] Error reading file:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('file:write', async (_, params) => {
        console.log('[IPC Main] Writing to file:', JSON.stringify(params.path));
        try {
            console.log('[IPC Main] Writing to file:', params.path);
            await (0, promises_1.writeFile)(params.path, params.content, 'utf-8');
            console.log('[IPC Main] File written successfully');
            return true;
        }
        catch (error) {
            console.error('[IPC Main] Error writing file:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('file:exists', async (_, params) => {
        console.log('[IPC Main] Checking if file exists:', JSON.stringify(params.path));
        try {
            await (0, promises_1.access)(params.path);
            console.log('[IPC Main] File exists:', params.path);
            return true;
        }
        catch {
            console.log('[IPC Main] File does not exist:', params.path);
            return false;
        }
    });
    electron_1.ipcMain.handle('readFile', async (_, filePath) => {
        console.log('[IPC Main] Reading file:', JSON.stringify(filePath));
        console.log('[IPC Main] File path type:', typeof filePath);
        try {
            const fullPath = (0, path_1.join)(process.cwd(), filePath);
            console.log('[IPC Main] Reading file:', fullPath);
            const content = await (0, promises_1.readFile)(fullPath, 'utf-8');
            console.log('[IPC Main] File read successfully, content length:', content.length);
            return content;
        }
        catch (error) {
            console.error('[IPC Main] Error reading file:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('readDir', async (_, dirPath) => {
        console.log('[IPC Main] Reading directory:', JSON.stringify(dirPath));
        try {
            const fullPath = (0, path_1.join)(process.cwd(), dirPath);
            console.log('[IPC Main] Reading directory:', fullPath);
            const files = await (0, promises_1.readdir)(fullPath);
            console.log('[IPC Main] Directory read successfully, files:', files);
            return files;
        }
        catch (error) {
            console.error('[IPC Main] Error reading directory:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('dialog:openFile', async () => {
        console.log('[IPC Main] Opening file dialog');
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'XML Files', extensions: ['xml'] }],
        });
        console.log('[IPC Main] Dialog result:', result);
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            try {
                console.log('[IPC Main] Reading selected file:', filePath);
                const content = await (0, promises_1.readFile)(filePath, 'utf-8');
                console.log('[IPC Main] File read successfully, content length:', content.length);
                // Update recent files
                const recentFiles = store.get('recentFiles', []);
                if (!recentFiles.includes(filePath)) {
                    recentFiles.unshift(filePath);
                    store.set('recentFiles', recentFiles.slice(0, 10));
                }
                return { filePath, content };
            }
            catch (error) {
                console.error('[IPC Main] Error reading selected file:', error);
                throw error;
            }
        }
        return null;
    });
    // Error logging
    electron_1.ipcMain.handle('init-log-file', async () => {
        try {
            await (0, promises_1.mkdir)((0, path_1.dirname)(LOG_FILE), { recursive: true });
            console.log('[IPC Main] Log directory initialized');
            return true;
        }
        catch (error) {
            console.error('[IPC Main] Error creating log directory:', error);
            return false;
        }
    });
    electron_1.ipcMain.handle('log-error', async (_, { logEntry }) => {
        try {
            await (0, promises_1.writeFile)(LOG_FILE, logEntry, { flag: 'a' });
            console.log('[IPC Main] Error logged successfully');
            return true;
        }
        catch (error) {
            console.error('[IPC Main] Error writing to log file:', error);
            return false;
        }
    });
    electron_1.ipcMain.handle('read-log', async () => {
        try {
            const logContent = await (0, promises_1.readFile)(LOG_FILE, 'utf-8');
            console.log('[IPC Main] Log read successfully, content length:', logContent.length);
            return logContent;
        }
        catch (error) {
            console.error('[IPC Main] Error reading log file:', error);
            return '';
        }
    });
    // XML operations
    electron_1.ipcMain.handle('xml:format', async (_, params) => {
        // TODO: Implement XML formatting
        return params.content;
    });
    electron_1.ipcMain.handle('xml:validate', async (_, params) => {
        // TODO: Implement XML validation
        return true;
    });
    console.log('[IPC Main] IPC handlers setup complete');
};
exports.setupIpcHandlers = setupIpcHandlers;
//# sourceMappingURL=ipc.js.map