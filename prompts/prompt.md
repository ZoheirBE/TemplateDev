## Project Overview
Create a Windows desktop XML viewer/editor using Electron, specifically designed for SWIFT message XML files, with support for XSLT transformations and XSD documentation. Built with TypeScript, React, Tailwind CSS, and Shadcn UI components, with Vite as the build tool.

## Core Functionality Requirements

### XML Document Handling
- View and edit XML content with syntax highlighting
- Real-time validation against XSD schemas
- Live XSLT transformation preview
- Recently opened files history
- File change watching for auto-reload
- Immediate feedback on validation errors

### Real-time Synchronization
- Implement bidirectional updates between views:
  - Changes in raw XML automatically update tree view
  - Modifications in tree view reflect in raw XML
  - Live preview of XSLT transformations as XML changes
  - Immediate validation against XSD schemas
- Maintain edit history for undo/redo operations
- Highlight validation errors in real-time
- Show transformation results as you type

### State Management
- Track current document state across all views
- Maintain edit history stack
- Handle concurrent updates between panels
- Preserve state during view switches
- Manage unsaved changes
- Support undo/redo operations

### File Handling
- Allow single XML file upload
- Load XSD schemas from the project's resource folder
- Enable saving/exporting modified files
- Maintain file history in the explorer panel
- Auto-save functionality
- Dirty state indication for unsaved changes

### XSLT Transformation Features
- Side-by-side display of original XML and transformation output
- Live transformation updates as XML changes
- Highlight XSLT rules inline
- Visual mapping between source and transformed output
- Error highlighting for invalid transformations

### Documentation Integration
- Parse and display XSD documentation from resource folder
- Display XSD documentation in properties panel
- Context-sensitive documentation based on selected XML elements
- Quick documentation lookup
- Documentation updates based on cursor position

### Search and Navigation
- Implement full-text search across all content
- Support advanced filtering options
- Include quick navigation features
- Provide breadcrumb navigation
- Maintain search state across view changes

## UI/UX Specification

### Layout Structure
Three-panel IDE-style interface:
- Uses Shadcn UI ResizableHandle and Separator components
- Responsive CSS Grid layout with resize functionality
- All panels maintain proportional sizing when window resizes

### Panel Components

#### Left Panel (File Explorer)
- Shadcn UI Card for file information container
- Shadcn UI ScrollArea for content overflow
- Fixed width with ResizableHandle for adjustment

#### Center Panel (Editor Area)
- Monaco Editor as the primary editing component featuring:
  - Built-in outline view for XML tree structure
  - Side-by-side split view for:
    - Original XML content
    - XSLT Transformation preview
  - Native features enabled:
    - Line numbers
    - Code folding
    - Syntax highlighting
    - Minimap
    - Multi-cursor support

#### Right Panel (Properties)
- Shadcn UI ScrollArea for documentation scrolling
- Shadcn UI Card for property section containers
- Shadcn UI Typography for documentation text
- Dynamic content updates based on selected XML nodes
- Syntax-highlighted code examples in documentation

### Common UI Elements

#### Top Toolbar
- Shadcn UI Button for Open/Save actions
- Shadcn UI DropdownMenu for recent files
- Shadcn UI Tooltip for action descriptions

#### Bottom Status Bar
- Shadcn UI Separator for visual division
- Flexbox layout for status items
- Error and validation status indicators

#### Dialog System
- Shadcn UI Dialog for error messages
- Shadcn UI AlertDialog for unsaved changes warnings
- Native OS file dialogs for file operations

### Interaction Patterns
- Cursor position drives properties panel updates
- Direct node selection in editor updates documentation
- Real-time validation feedback
- Automatic synchronization between views
- File change detection and reload prompts

### Layout Structure
Three-panel IDE-style interface using Shadcn UI's ResizableHandle:
- Left Panel: File explorer showing current file
- Center Panel: Editor with Monaco Editor featuring:
  - Side-by-side view of XML and transformations
  - Built-in outline view for XML structure
  - Code folding and syntax highlighting
- Right Panel: Properties and documentation that updates based on selection
- Top Toolbar: File operations
- Bottom Status Bar: Validation status

### Component Specifications

#### Top Toolbar
- Shadcn UI Button components for file operations
- Dropdown menu for recent files
- Tooltips for action descriptions

#### Editor Area (Center Panel)
- Monaco Editor as primary editing component
- Built-in outline view for XML structure
- Split view for transformation preview
- Syntax highlighting for XML
- Line numbers and code folding

#### Properties Panel
- Scrollable documentation area
- Dynamic content updates based on cursor position/selection
- Property sections in cards
- Syntax-highlighted code examples

#### Dialog System
- Shadcn UI dialogs for alerts and confirmations
- Native OS file dialogs for file operations
- Unsaved changes warnings

## Technical Requirements

### Development Environment
- Vite + Electron development setup
- Debugging support for both main and renderer processes
- TypeScript for type safety
- Hot reload during development

### File System Integration
- OS-native file dialogs
- File change watching
- Recent files persistence
- Auto-save capability

### Core Technologies
- Electron for desktop framework
- React + TypeScript for UI
- Tailwind CSS for styling
- Shadcn UI for components
- Monaco Editor for XML editing
- Vite for development and building

### Project Structure
xml-editor/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React application
│   │   ├── components/    
│   │   ├── layouts/
│   │   └── views/
│   └── shared/           # Shared types/utilities
├── resources/
│   └── xsd/             # XSD schema files
└── electron/            # Electron configuration

## Build & Distribution
- Windows-focused build
- Simple installer package
- No auto-update mechanism required