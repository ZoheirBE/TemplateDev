"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const fs_1 = require("fs");
const path = __importStar(require("path"));
function setupIpcHandlers() {
    // File operations
    electron_1.ipcMain.handle('readFile', async (event, filePath) => {
        try {
            console.log('[IPC] Reading file:', filePath);
            if (!filePath) {
                throw new Error('No file path provided');
            }
            const content = await fs_1.promises.readFile(filePath, 'utf-8');
            console.log('[IPC] File read successfully, length:', content.length);
            return content;
        }
        catch (error) {
            console.error('[IPC] Error reading file:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('readDir', async (event, dirPath) => {
        try {
            const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath);
            return await fs_1.promises.readdir(fullPath);
        }
        catch (error) {
            console.error('[IPC] Error reading directory:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=ipcHandlers.js.map