import { IPC_CHANNELS, FileErrorMessage } from '../../shared/ipc';
import { ipcService } from './ipcService';

export type ErrorType = 
  | 'FILE_READ_ERROR'
  | 'FILE_WRITE_ERROR'
  | 'FILE_WATCH_ERROR'
  | 'XML_FORMAT_ERROR';

class ErrorService {
  private static instance: ErrorService;
  private ipcInitialized: boolean = false;

  private constructor() {
    console.log('[Error Service] Initializing error service');
  }

  private ensureIpcConnection(): boolean {
    if (!this.ipcInitialized && window.electron?.ipcRenderer) {
      this.ipcInitialized = true;
    }
    return this.ipcInitialized;
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public logError(error: Error, type: ErrorType): void {
    if (!this.ensureIpcConnection()) {
      console.error('[Error Service] IPC not initialized, logging locally:', error);
      return;
    }

    const message: FileErrorMessage = {
      error: error.message,
      type,
      filePath: ''
    };

    try {
      ipcService.send(IPC_CHANNELS.FILE_ERROR, message);
    } catch (err) {
      console.error('[Error Service] Failed to send error through IPC:', err);
    }
  }
}

export const errorService = ErrorService.getInstance();
