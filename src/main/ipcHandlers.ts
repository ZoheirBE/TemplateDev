import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { 
  FileReadMessage, 
  FileReadResponse, 
  FileWriteMessage, 
  FileWriteResponse, 
  FileErrorMessage,
  IPC_CHANNELS 
} from '../shared/ipc';

export function setupIpcHandlers() {
  console.log('[IPC] Setting up IPC handlers');
  
  // File operations
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (event, message: FileReadMessage) => {
    try {
      console.log('[IPC] Reading file:', message);
      if (!message?.filePath) {
        throw new Error('No file path provided');
      }
      const content = await fs.readFile(message.filePath, 'utf-8');
      console.log('[IPC] File read successfully, length:', content.length);
      return { content } as FileReadResponse;
    } catch (err) {
      console.error('[IPC] Error reading file:', err);
      const error = err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        content: '',
        error
      } as FileReadResponse;
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (event, message: FileWriteMessage) => {
    try {
      console.log('[IPC] Writing file:', message);
      if (!message?.filePath) {
        throw new Error('No file path provided');
      }
      await fs.writeFile(message.filePath, message.content, 'utf-8');
      console.log('[IPC] File written successfully');
      return { success: true } as FileWriteResponse;
    } catch (err) {
      console.error('[IPC] Error writing file:', err);
      const error = err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        success: false,
        error
      } as FileWriteResponse;
    }
  });

  // File error logging
  ipcMain.on(IPC_CHANNELS.FILE_ERROR, (event, message: FileErrorMessage) => {
    console.error('[IPC] File error:', message);
    // Here you could add additional error logging logic
  });

  // Test IPC connection
  ipcMain.on(IPC_CHANNELS.TEST_IPC, (event, arg) => {
    console.log('[IPC] Received test message:', arg);
    event.reply(IPC_CHANNELS.TEST_IPC_REPLY, 'IPC connection working');
  });

  // File change notifications
  ipcMain.on(IPC_CHANNELS.FILE_CHANGED, (event, filePath: string) => {
    console.log('[IPC] File changed:', filePath);
    event.sender.send(IPC_CHANNELS.FILE_CHANGED, filePath);
  });

  ipcMain.on(IPC_CHANNELS.FILE_DELETED, (event, filePath: string) => {
    console.log('[IPC] File deleted:', filePath);
    event.sender.send(IPC_CHANNELS.FILE_DELETED, filePath);
  });
}
