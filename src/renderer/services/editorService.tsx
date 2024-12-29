import React, { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import { TreeItem } from '../components/ui/tree';
import { ipcService, ipcRenderer } from './ipcService';
import { IPC_CHANNELS, FileOpenMessage } from '../../shared/ipc';

// Types and Interfaces
export interface CursorPosition {
  line: number;
  column: number;
}

export interface ValidationStatus {
  isValid: boolean;
  error?: string;
}

// Additional properties for file content
interface FileProperties {
  content?: string;
  path?: string;
  isDirty?: boolean;
  hasExternalChanges?: boolean;
}

// Combine TreeItem with file properties
export type FileContent = TreeItem & FileProperties;

// Extended file interface for editor state
export interface EditorState {
  files: FileContent[];
  selectedFile: FileContent | null;
  cursorPosition: CursorPosition | null;
  validationStatus: ValidationStatus | null;
  encoding: string;
  theme: 'light' | 'dark';
  layout: {
    explorerWidth: string;
    propertiesWidth: string;
    toolbarVisible: boolean;
  };
  schema: {
    documentation?: string;
    validationStatus?: string;
  };
  undoStack: { id: string; content: string }[];
  redoStack: { id: string; content: string }[];
  isLoading: boolean;
}

// Action Types
export type EditorAction =
  | { type: 'SET_FILES'; payload: FileContent[] }
  | { type: 'SELECT_FILE'; payload: string }
  | { type: 'SET_CURSOR_POSITION'; payload: CursorPosition }
  | { type: 'SET_VALIDATION_STATUS'; payload: ValidationStatus }
  | { type: 'SET_ENCODING'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LAYOUT'; payload: Partial<EditorState['layout']> }
  | { type: 'SET_SCHEMA'; payload: Partial<EditorState['schema']> }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { id: string; content: string; isDirty?: boolean } }
  | { type: 'SET_FILE_DIRTY'; payload: { id: string; isDirty: boolean } }
  | { type: 'SET_FILE_EXTERNAL_CHANGE'; payload: { id: string; hasExternalChanges: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'NEW_FILE' }
  | { type: 'OPEN_FILE' }
  | { type: 'SAVE_FILE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CUT' }
  | { type: 'COPY' }
  | { type: 'PASTE' }
  | { type: 'FORMAT_XML' }
  | { type: 'VALIDATE_XML' };

// Initial State
export const initialState: EditorState = {
  files: [],
  selectedFile: null,
  cursorPosition: null,
  validationStatus: null,
  encoding: 'utf-8',
  theme: 'dark',
  layout: {
    explorerWidth: '20',
    propertiesWidth: '20',
    toolbarVisible: true,
  },
  schema: {},
  undoStack: [],
  redoStack: [],
  isLoading: false,
};

// Reducer
export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_FILES': {
      // Merge new files with existing files, avoiding duplicates
      console.log('[Editor] SET_FILES - Current files:', state.files.length, 'New files:', action.payload.length);
      const existingFiles = state.files.filter(file => 
        !action.payload.some(newFile => newFile.id === file.id)
      );
      const newState = { ...state, files: [...existingFiles, ...action.payload] };
      console.log('[Editor] SET_FILES - Updated files:', newState.files.length);
      return newState;
    }

    case 'SELECT_FILE': {
      console.log('[Editor] SELECT_FILE -', action.payload);
      const selectedFile = state.files.find(file => file.id === action.payload) || null;
      console.log('[Editor] Found file:', selectedFile?.name);
      return { 
        ...state, 
        selectedFile,
        undoStack: [],
        redoStack: [],
        isLoading: true,
      };
    }

    case 'UPDATE_FILE_CONTENT': {
      console.log('[Editor] UPDATE_FILE_CONTENT -', action.payload.id);
      
      // Check if content actually changed
      const currentFile = state.files.find(f => f.id === action.payload.id);
      if (currentFile?.content === action.payload.content) {
        console.log('[Editor] Content unchanged, skipping update');
        return state;
      }

      const updatedFiles = state.files.map(file => {
        if (file.id === action.payload.id) {
          return {
            ...file,
            content: action.payload.content,
            isDirty: action.payload.isDirty ?? file.isDirty ?? false,
          };
        }
        return file;
      });

      const selectedFile = state.selectedFile && state.selectedFile.id === action.payload.id
        ? { 
            ...state.selectedFile, 
            content: action.payload.content,
            isDirty: action.payload.isDirty ?? state.selectedFile.isDirty ?? false
          }
        : state.selectedFile;

      // Only add to undo stack if this is a user action and content changed
      const undoStack = action.payload.isDirty !== undefined && currentFile?.content !== undefined
        ? [...state.undoStack, { id: action.payload.id, content: currentFile.content }]
        : state.undoStack;

      console.log('[Editor] File content updated, isDirty:', action.payload.isDirty);
      return {
        ...state,
        files: updatedFiles,
        selectedFile,
        undoStack,
        redoStack: action.payload.isDirty !== undefined ? [] : state.redoStack,
        isLoading: false,
      };
    }

    case 'SET_FILE_DIRTY': {
      const updatedFiles = state.files.map(file => {
        if (file.id === action.payload.id) {
          return { ...file, isDirty: action.payload.isDirty };
        }
        return file;
      });

      const selectedFile = state.selectedFile && state.selectedFile.id === action.payload.id
        ? { ...state.selectedFile, isDirty: action.payload.isDirty }
        : state.selectedFile;

      return {
        ...state,
        files: updatedFiles,
        selectedFile,
      };
    }

    case 'SET_FILE_EXTERNAL_CHANGE': {
      const updatedFiles = state.files.map(file => {
        if (file.id === action.payload.id) {
          return { ...file, hasExternalChanges: action.payload.hasExternalChanges };
        }
        return file;
      });

      const selectedFile = state.selectedFile && state.selectedFile.id === action.payload.id
        ? { ...state.selectedFile, hasExternalChanges: action.payload.hasExternalChanges }
        : state.selectedFile;

      return {
        ...state,
        files: updatedFiles,
        selectedFile,
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UNDO': {
      if (state.undoStack.length === 0 || !state.selectedFile) return state;
      
      const lastUndo = state.undoStack[state.undoStack.length - 1];
      if (lastUndo.id !== state.selectedFile.id) return state;

      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { id: state.selectedFile.id, content: state.selectedFile.content || '' }],
        selectedFile: { ...state.selectedFile, content: lastUndo.content, isDirty: true },
        files: state.files.map(file => 
          file.id === state.selectedFile?.id 
            ? { ...file, content: lastUndo.content, isDirty: true }
            : file
        ),
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0 || !state.selectedFile) return state;
      
      const lastRedo = state.redoStack[state.redoStack.length - 1];
      if (lastRedo.id !== state.selectedFile.id) return state;

      return {
        ...state,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, { id: state.selectedFile.id, content: state.selectedFile.content || '' }],
        selectedFile: { ...state.selectedFile, content: lastRedo.content, isDirty: true },
        files: state.files.map(file => 
          file.id === state.selectedFile?.id 
            ? { ...file, content: lastRedo.content, isDirty: true }
            : file
        ),
      };
    }

    case 'SET_VALIDATION_STATUS':
      return { ...state, validationStatus: action.payload };

    case 'SET_ENCODING':
      return { ...state, encoding: action.payload };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'SET_LAYOUT':
      return { ...state, layout: { ...state.layout, ...action.payload } };

    case 'SET_SCHEMA': {
      console.log('[Editor] SET_SCHEMA -', action.payload);
      return {
        ...state,
        schema: {
          ...state.schema,
          ...action.payload
        }
      };
    }

    case 'SET_CURSOR_POSITION': {
      console.log('[Editor] SET_CURSOR_POSITION -', action.payload);
      return { ...state, cursorPosition: action.payload };
    }

    case 'NEW_FILE': {
      const newFileId = `untitled-${state.files.length + 1}`;
      const newFile: FileContent = {
        id: newFileId,
        name: `Untitled-${state.files.length + 1}`,
        type: 'file',
        content: '',
        isDirty: false
      };

      return {
        ...state,
        files: [...state.files, newFile],
        selectedFile: newFile,
        undoStack: [],
        redoStack: [],
        isLoading: false,
      };
    }

    case 'OPEN_FILE': {
      const selectedFile = state.selectedFile;
      if (!selectedFile) return state;

      return {
        ...state,
        undoStack: [],
        redoStack: [],
        isLoading: true,
      };
    }

    case 'SAVE_FILE':
    case 'CUT':
    case 'COPY':
    case 'PASTE':
    case 'FORMAT_XML':
    case 'VALIDATE_XML':
      return state;

    default:
      return state;
  }
}

// Context Type
interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

// Context
export const EditorContext = createContext<EditorContextType>({
  state: initialState,
  dispatch: () => null,
});

interface EditorProviderProps {
  children: ReactNode;
}

// Provider Component
export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Set up IPC service
  useEffect(() => {
    console.log('[Editor] Setting up IPC handlers');

    // Handle file open events
    const handleOpenFile = (message: FileOpenMessage) => {
      console.log('[Editor] handleOpenFile called with:', message);
      
      if (!message?.filePath) {
        console.error('[Editor] No file path in message:', message);
        return;
      }

      (async () => {
        try {
          console.log('[Editor] Reading file:', message.filePath);
          const response = await ipcService.readFile(message.filePath);
          console.log('[Editor] File content loaded, length:', response.content.length);
          
          const fileName = message.filePath.split('\\').pop() || 'untitled';
          const newFile = {
            id: message.filePath,
            name: fileName,
            content: response.content,
            path: message.filePath,
            type: 'file' as const,
            isDirty: false,
          };

          dispatch({ type: 'SET_FILES', payload: [newFile] });
          dispatch({ type: 'SELECT_FILE', payload: message.filePath });
        } catch (error) {
          console.error('[Editor] Error loading file:', error);
        }
      })();
    };

    // Subscribe to IPC events
    console.log('[Editor] Setting up file open handler');
    ipcService.on(IPC_CHANNELS.FILE_OPEN, handleOpenFile);

    return () => {
      console.log('[Editor] Cleaning up IPC handlers');
      ipcService.removeAllListeners(IPC_CHANNELS.FILE_OPEN);
    };
  }, []);

  // Context value
  const value = useMemo(() => ({
    state,
    dispatch: (action: EditorAction) => {
      // Local dispatch
      dispatch(action);
      // Send to main process if needed
      if (action.type.startsWith('SAVE_') || action.type.startsWith('NEW_') || action.type.startsWith('OPEN_')) {
        ipcService.dispatch(action).catch(console.error);
      }
    }
  }), [state]);

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

// Hook
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
