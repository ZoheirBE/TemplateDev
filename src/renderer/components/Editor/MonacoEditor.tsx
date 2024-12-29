import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useEditor } from '../../services/editorService';

const MonacoEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { state, dispatch } = useEditor();
  const { selectedFile } = state;

  // Add debug logging
  useEffect(() => {
    console.log('[MonacoEditor] Component mounted');
    return () => console.log('[MonacoEditor] Component unmounted');
  }, []);

  // Update editor content when selectedFile changes
  useEffect(() => {
    console.log('[MonacoEditor] selectedFile changed:', selectedFile?.name);
    if (editorRef.current && selectedFile?.content !== undefined) {
      const currentValue = editorRef.current.getValue();
      // Only update if content actually changed
      if (currentValue !== selectedFile.content) {
        console.log('[MonacoEditor] Setting content from selectedFile:', selectedFile.name);
        editorRef.current.setValue(selectedFile.content);
        validateXml(selectedFile.content);
      }
    }
  }, [selectedFile]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    console.log('[MonacoEditor] Editor mounted');
    editorRef.current = editor;
    
    // Define VS Code Dark Theme
    monaco.editor.defineTheme('vscode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'variable', foreground: '9CDCFE' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.selectionHighlightBackground': '#ADD6FF26',
        'editor.lineHighlightBackground': '#2F2F2F',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editor.selectionBackground': '#264F78',
        'editor.wordHighlightBackground': '#575757B8',
        'editor.wordHighlightStrongBackground': '#004972B8',
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#888888'
      }
    });

    // Set the theme
    monaco.editor.setTheme('vscode-dark');
    
    // Set initial content if available
    if (selectedFile?.content !== undefined) {
      console.log('[MonacoEditor] Setting initial content from selectedFile:', selectedFile.name);
      editor.setValue(selectedFile.content);
      validateXml(selectedFile.content);
    }

    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      dispatch({
        type: 'SET_CURSOR_POSITION',
        payload: {
          line: e.position.lineNumber,
          column: e.position.column
        }
      });
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined && selectedFile) {
      const currentContent = selectedFile.content;
      // Only dispatch if content actually changed
      if (currentContent !== value) {
        dispatch({ 
          type: 'UPDATE_FILE_CONTENT', 
          payload: { 
            id: selectedFile.id, 
            content: value,
            isDirty: true
          } 
        });
        validateXml(value);
      }
    }
  };

  // XML validation function
  const validateXml = (content: string) => {
    try {
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const isValid = !doc.getElementsByTagName('parsererror').length;

      dispatch({
        type: 'SET_VALIDATION_STATUS',
        payload: {
          isValid,
          error: isValid ? undefined : 'Invalid XML syntax'
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_VALIDATION_STATUS',
        payload: {
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  };

  return (
    <div className="h-full w-full bg-background">
      <Editor
        className="bg-background"
        height="100%"
        defaultLanguage="xml"
        theme="vscode-dark"
        value={selectedFile?.content || ''}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'none',
          fixedOverflowWidgets: true,
          fontFamily: 'Consolas, "Courier New", monospace',
          fontSize: 14,
          lineHeight: 20,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
          }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
