import { ipcRenderer } from 'electron';
import { fileWatcherService } from './fileWatcherService';
import { errorService } from './ErrorService';
import { type EditorContextType } from './editorService';
import { IPC_CHANNELS, FileChangeMessage } from '../../shared/ipc';

export class SyncService {
  private static instance: SyncService;
  private editor: EditorContextType | null = null;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.setupIpcListeners();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public initialize(editor: EditorContextType): void {
    this.editor = editor;
  }

  private setupIpcListeners(): void {
    ipcRenderer.on(IPC_CHANNELS.FILE_DELETED, (_, filePath: string) => {
      if (!this.editor) return;
      
      const file = this.editor.state.files.find(f => f.path === filePath);
      if (file && file.isDirty) {
        // File was deleted but has unsaved changes
        this.showFileDeletedDialog(file.id);
      } else if (file) {
        // File was deleted with no unsaved changes
        this.removeFile(file.id);
      }
    });

    ipcRenderer.on(IPC_CHANNELS.FILE_CHANGED, (_, filePath: string) => {
      if (!this.editor) return;
      
      const file = this.editor.state.files.find(f => f.path === filePath);
      if (file) {
        if (file.isDirty) {
          // File changed externally but has unsaved changes
          this.editor.dispatch({
            type: 'SET_FILE_EXTERNAL_CHANGE',
            payload: { id: file.id, hasExternalChanges: true }
          });
        } else {
          // File changed externally with no unsaved changes, reload it
          this.reloadFile(file.id);
        }
      }
    });
  }

  public watchFile(filePath: string, fileId: string): void {
    fileWatcherService.watchFile(filePath, {
      onFileChange: () => {
        ipcRenderer.emit(IPC_CHANNELS.FILE_CHANGED, filePath);
      },
      onFileDelete: () => {
        ipcRenderer.emit(IPC_CHANNELS.FILE_DELETED, filePath);
      },
      onError: (error) => {
        errorService.logError(error, 'FILE_WATCH_ERROR');
      }
    });
  }

  private async reloadFile(fileId: string): Promise<void> {
    if (!this.editor) return;

    const file = this.editor.state.files.find(f => f.id === fileId);
    if (!file || !file.path) return;

    try {
      const content = await ipcRenderer.invoke(IPC_CHANNELS.READ_FILE, file.path);
      this.editor.dispatch({
        type: 'UPDATE_FILE_CONTENT',
        payload: { id: fileId, content, isDirty: false }
      });
    } catch (error) {
      errorService.logError(error as Error, 'FILE_RELOAD_ERROR');
    }
  }

  private removeFile(fileId: string): void {
    if (!this.editor) return;

    const file = this.editor.state.files.find(f => f.id === fileId);
    if (!file || !file.path) return;

    fileWatcherService.unwatchFile(file.path);
    this.editor.dispatch({
      type: 'SET_FILES',
      payload: this.editor.state.files.filter(f => f.id !== fileId)
    });
  }

  private async showFileDeletedDialog(fileId: string): Promise<void> {
    if (!this.editor) return;

    const file = this.editor.state.files.find(f => f.id === fileId);
    if (!file) return;

    const response = await ipcRenderer.invoke(IPC_CHANNELS.SHOW_FILE_DELETED_DIALOG, {
      filename: file.path,
      hasUnsavedChanges: file.isDirty
    });

    if (response === 'save') {
      try {
        await ipcRenderer.invoke(IPC_CHANNELS.SAVE_FILE, {
          path: file.path,
          content: file.content
        });
        this.removeFile(fileId);
      } catch (error) {
        errorService.logError(error as Error, 'FILE_SAVE_ERROR');
      }
    } else if (response === 'discard') {
      this.removeFile(fileId);
    }
  }

  public cleanup(): void {
    fileWatcherService.unwatchAll();
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

export const syncService = SyncService.getInstance();
