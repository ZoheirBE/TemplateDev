import React from 'react';
import { useEditor } from '../../services/editorService';
import { Separator } from '../ui/separator';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { state } = useEditor();
  const { selectedFile, cursorPosition, validationStatus, encoding } = state;

  return (
    <div className="h-6 border-t flex items-center px-2 text-sm text-muted-foreground bg-muted">
      <div className="flex items-center gap-2">
        <span>{selectedFile?.path || 'No file selected'}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>Line {cursorPosition?.line}, Column {cursorPosition?.column}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>{encoding || 'UTF-8'}</span>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1">
          {validationStatus?.isValid ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Valid XML</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-red-500">
                {validationStatus?.error || 'Invalid XML'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
