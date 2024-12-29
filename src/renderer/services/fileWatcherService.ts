import { watch } from 'fs';
import { errorService } from './ErrorService';
import { ipcRenderer } from 'electron';

export interface FileWatcherOptions {
  onFileChange?: () => void;
  onFileDelete?: () => void;
  onError?: (error: Error) => void;
}

export class FileWatcherService {
  private static instance: FileWatcherService;
  private watchers: Map<string, ReturnType<typeof watch>> = new Map();

  private constructor() {}

  public static getInstance(): FileWatcherService {
    if (!FileWatcherService.instance) {
      FileWatcherService.instance = new FileWatcherService();
    }
    return FileWatcherService.instance;
  }

  public watchFile(filePath: string, options: FileWatcherOptions = {}): void {
    try {
      // Remove existing watcher if any
      this.unwatchFile(filePath);

      const watcher = watch(filePath, (eventType, filename) => {
        if (eventType === 'change' && options.onFileChange) {
          options.onFileChange();
        } else if (eventType === 'rename') {
          // File might have been deleted or renamed
          ipcRenderer.invoke('check-file-exists', filePath).then((exists: boolean) => {
            if (!exists && options.onFileDelete) {
              options.onFileDelete();
            }
          });
        }
      });

      watcher.on('error', (error) => {
        errorService.logError(error, 'FILE_WATCH_ERROR');
        if (options.onError) {
          options.onError(error);
        }
      });

      this.watchers.set(filePath, watcher);
    } catch (error) {
      errorService.logError(error as Error, 'FILE_WATCH_INIT_ERROR');
      if (options.onError) {
        options.onError(error as Error);
      }
    }
  }

  public unwatchFile(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }
  }

  public unwatchAll(): void {
    for (const [filePath] of this.watchers) {
      this.unwatchFile(filePath);
    }
  }
}

export const fileWatcherService = FileWatcherService.getInstance();
