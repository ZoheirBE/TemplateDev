import React from 'react';
import ThreePanel from './components/Layout/ThreePanel';
import { EditorProvider } from './services/editorService';
import { ThemeProvider } from './components/ui/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="xml-editor-theme">
      <TooltipProvider>
        <EditorProvider>
          <div className="h-screen bg-background text-foreground">
            <ThreePanel />
          </div>
        </EditorProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
