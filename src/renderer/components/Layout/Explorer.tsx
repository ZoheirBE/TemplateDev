import React from 'react';
import { Tree, TreeItem } from '../ui/tree';
import { useEditor } from '../../services/editorService';
import { ScrollArea } from '../ui/scroll-area';

export const Explorer: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { files, selectedFile } = state;

  const handleFileSelect = (item: TreeItem) => {
    if (item.type === 'file') {
      dispatch({ type: 'SELECT_FILE', payload: item.id });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Explorer</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <Tree
            data={files}
            onSelect={handleFileSelect}
            selectedId={selectedFile?.id}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Explorer;
