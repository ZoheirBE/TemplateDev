import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Explorer } from './Explorer';
import { Documentation } from '../Documentation/Documentation';
import { useEditor } from '../../services/editorService';
import MonacoEditor from '../Editor/MonacoEditor';
import Properties from './Properties';
import Toolbar from '../Toolbar';
import StatusBar from '../StatusBar';

interface ThreePanelProps {
  className?: string;
}

const ThreePanel: React.FC<ThreePanelProps> = ({ className }) => {
  const { state, dispatch } = useEditor();
  const { explorerWidth, propertiesWidth, toolbarVisible } = state.layout;

  const handleResizeExplorer = (sizes: number[]) => {
    dispatch({
      type: 'SET_LAYOUT',
      payload: {
        explorerWidth: sizes[0]
      }
    });
  };

  const handleResizeProperties = (sizes: number[]) => {
    dispatch({
      type: 'SET_LAYOUT',
      payload: {
        propertiesWidth: sizes[2]
      }
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {toolbarVisible && <Toolbar />}
      <ResizablePanelGroup
        direction="horizontal"
        className={className}
        onLayout={(sizes) => {
          handleResizeExplorer(sizes);
          handleResizeProperties(sizes);
        }}
      >
        {/* Explorer Panel */}
        <ResizablePanel
          defaultSize={20}
          minSize={10}
          maxSize={40}
        >
          <Explorer />
        </ResizablePanel>
        <ResizableHandle />
        {/* Editor Panel */}
        <ResizablePanel defaultSize={60}>
          <MonacoEditor />
        </ResizablePanel>
        <ResizableHandle />
        {/* Properties Panel */}
        <ResizablePanel
          defaultSize={20}
          minSize={10}
          maxSize={40}
        >
          <Properties />
        </ResizablePanel>
      </ResizablePanelGroup>
      <StatusBar />
    </div>
  );
};

export default ThreePanel;
