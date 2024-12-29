import React from 'react';
import { useEditor, FileContent } from '../../services/editorService';
import { ipcService } from '../../services/ipcService';
import { errorService } from '../../services/ErrorService';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { TooltipWrapper } from '../ui/tooltip';
import {
  FileIcon,
  SaveIcon,
  UndoIcon,
  RedoIcon,
  ScissorsIcon,
  CopyIcon,
  ClipboardIcon,
  CheckCircleIcon,
  CodeIcon,
  SunIcon,
  MoonIcon
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { theme } = state;

  const handleNewFile = () => dispatch({ type: 'NEW_FILE' });
  
  const handleOpenFile = async () => {
    try {
      const result = await ipcService.openFile();
      if (result) {
        const { filePath, content } = result;
        // First check if file exists
        const exists = await ipcService.checkFileExists(filePath);
        if (!exists) {
          errorService.logError(`File ${filePath} does not exist`, 'FILE_NOT_FOUND');
          return;
        }

        const newFile: FileContent = {
          id: filePath,
          name: filePath.split('/').pop() || 'Untitled',
          type: 'file',
          path: filePath,
          content
        };

        dispatch({ type: 'SET_FILES', payload: [...state.files, newFile] });
        dispatch({ type: 'SELECT_FILE', payload: newFile.id });
      }
    } catch (error) {
      errorService.logError(error as Error, 'FILE_OPEN_ERROR');
    }
  };

  const handleSaveFile = async () => {
    if (!state.selectedFile?.path || !state.selectedFile?.content) return;
    
    try {
      await ipcService.writeFile(state.selectedFile.path, state.selectedFile.content);
      dispatch({ type: 'SAVE_FILE' });
    } catch (error) {
      errorService.logError(error as Error, 'FILE_SAVE_ERROR');
    }
  };

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });
  const handleCut = () => dispatch({ type: 'CUT' });
  const handleCopy = () => dispatch({ type: 'COPY' });
  const handlePaste = () => dispatch({ type: 'PASTE' });
  const handleFormat = () => dispatch({ type: 'FORMAT_XML' });
  const handleValidate = () => dispatch({ type: 'VALIDATE_XML' });
  const handleThemeToggle = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <div className="h-12 border-b flex items-center px-2 gap-2">
      <div className="flex items-center gap-1">
        <TooltipWrapper content="New File">
          <Button variant="ghost" size="icon" onClick={() => handleNewFile()}>
            <FileIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Open File">
          <Button variant="ghost" size="icon" onClick={() => handleOpenFile()}>
            <FileIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Save File">
          <Button variant="ghost" size="icon" onClick={handleSaveFile}>
            <SaveIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <TooltipWrapper content="Undo">
          <Button variant="ghost" size="icon" onClick={handleUndo}>
            <UndoIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Redo">
          <Button variant="ghost" size="icon" onClick={handleRedo}>
            <RedoIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <TooltipWrapper content="Cut">
          <Button variant="ghost" size="icon" onClick={handleCut}>
            <ScissorsIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Copy">
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Paste">
          <Button variant="ghost" size="icon" onClick={handlePaste}>
            <ClipboardIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <TooltipWrapper content="Format XML">
          <Button variant="ghost" size="icon" onClick={handleFormat}>
            <CodeIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper content="Validate XML">
          <Button variant="ghost" size="icon" onClick={handleValidate}>
            <CheckCircleIcon className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      <div className="flex-1" />

      <TooltipWrapper content="Toggle Theme">
        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          {theme === 'dark' ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </Button>
      </TooltipWrapper>
    </div>
  );
};

export default Toolbar;
