import { IpcChannel, IPC_CHANNELS, FileReadMessage, FileReadResponse, FileWriteMessage, FileWriteResponse } from 'shared/ipc';
import { errorService } from './ErrorService';
import { EditorAction } from './editorService';

// Create a type-safe wrapper around the exposed IPC functionality
export const ipcService = {
  send: (channel: IpcChannel, data: unknown) => {
    try {
      window.electron.ipcRenderer.send(channel, data);
    } catch (error) {
      console.error('[IPC Service] Error sending message:', error);
      throw error;
    }
  },

  invoke: async <T>(channel: IpcChannel, data: unknown): Promise<T> => {
    try {
      return await window.electron.ipcRenderer.invoke(channel, data);
    } catch (error) {
      console.error('[IPC Service] Error invoking channel:', channel, error);
      throw error;
    }
  },

  on: (channel: IpcChannel, func: (...args: unknown[]) => void) => {
    try {
      window.electron.ipcRenderer.on(channel, func);
    } catch (error) {
      console.error('[IPC Service] Error registering listener:', error);
      throw error;
    }
  },

  removeListener: (channel: IpcChannel, func: (...args: unknown[]) => void) => {
    try {
      window.electron.ipcRenderer.removeListener(channel, func);
    } catch (error) {
      console.error('[IPC Service] Error removing listener:', error);
      throw error;
    }
  },

  removeAllListeners: (channel: IpcChannel) => {
    try {
      window.electron.ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      console.error('[IPC Service] Error removing all listeners:', error);
      throw error;
    }
  },

  // Convenience methods for file operations
  readFile: async (filePath: string): Promise<FileReadResponse> => {
    try {
      console.log('[IPC Service] Reading file:', filePath);
      const message: FileReadMessage = { filePath };
      const response = await window.electron.ipcRenderer.invoke<FileReadResponse>(IPC_CHANNELS.FILE_READ, message);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response;
    } catch (error) {
      console.error('[IPC Service] Error reading file:', error);
      throw error;
    }
  },

  writeFile: async (filePath: string, content: string): Promise<FileWriteResponse> => {
    try {
      console.log('[IPC Service] Writing file:', filePath);
      const message: FileWriteMessage = { filePath, content };
      const response = await window.electron.ipcRenderer.invoke<FileWriteResponse>(IPC_CHANNELS.FILE_WRITE, message);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      return response;
    } catch (error) {
      console.error('[IPC Service] Error writing file:', error);
      throw error;
    }
  }
};

// Extend the Window interface to include our electron API
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: IpcChannel, data: unknown): void;
        invoke<T>(channel: IpcChannel, data: unknown): Promise<T>;
        on(channel: IpcChannel, func: (...args: unknown[]) => void): void;
        removeListener(channel: IpcChannel, func: (...args: unknown[]) => void): void;
        removeAllListeners(channel: IpcChannel): void;
      };
    };
  }
}
