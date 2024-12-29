# XML Editor

A modern, web-based XML editor specifically designed for SWIFT message XML files. Built with Electron, React, and TypeScript, it provides a powerful IDE-like experience with real-time XSD validation and integrated documentation.

## Features

- 🎯 IDE-style interface with multiple synchronized views
- ✨ Real-time XSD validation
- 📚 Integrated documentation
- 🔧 Powered by Monaco Editor
- 🎨 Modern UI with Shadcn UI and Tailwind CSS
- 🔄 Electron-based for cross-platform support

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Apply typescript best practices
- Use Powershell for terminal command
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)

## Naming Conventions
- Use lowercase with dashes for directories (e.g., components/form-wizard)
- Favor named exports for components and utilities
- Use PascalCase for component files (e.g., VisaForm.tsx)
- Use camelCase for utility files (e.g., formValidator.ts)

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use const objects with 'as const' assertion
- Use functional components with TypeScript interfaces
- Define strict types for message passing between different parts of the extension
- Use absolute imports for all files @/...
- Avoid try/catch blocks unless there's good reason to translate or handle error in that abstraction
- Use explicit return types for all functions

## State Management
- Use React Context for global state when needed
- Implement proper cleanup in useEffect hooks

## Syntax and Formatting
- Use "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX
- Implement proper TypeScript discriminated unions for message types

## UI and Styling
- Use Shadcn UI and Radix for components
- use `npx shadcn@latest add <component-name>` to add new shadcn components
- Implement Tailwind CSS for styling
- Consider extension-specific constraints (popup dimensions, permissions)
- When adding new shadcn component, document the installation command

## Error Handling
- Implement proper error boundaries
- Log errors appropriately for debugging
- Provide user-friendly error messages
- Handle network failures gracefully

## Documentation
- Don't include comments unless it's for complex logic

## Project Structure

```
src/
├── resources/                      # XSD and resource files
├── main/                          # Electron main process
│   ├── index.ts                   # Main entry point
│   ├── services/
│   │   ├── fileSystem.ts          # File operations and management
│   │   └── ipc.ts                 # Inter-process communication handlers
│   └── window.ts                  # Window management and configuration
├── renderer/                      # Frontend application
│   ├── App.tsx                    # Root React component
│   ├── index.tsx                  # Renderer entry point
│   ├── components/
│   │   ├── Editor/               # Core editing functionality
│   │   │   ├── MonacoEditor      # Monaco editor integration
│   │   │   ├── validation        # XML validation engine
│   │   │   └── schema           # XSD schema handling
│   │   ├── Layout/               # Application layout components
│   │   │   ├── ThreePanel        # Main three-panel layout
│   │   │   ├── Explorer          # File system explorer
│   │   │   └── Properties        # XML properties panel
│   │   ├── Toolbar/              # Application toolbar
│   │   └── StatusBar/            # Status information display
│   ├── services/                 # Frontend services
│   │   ├── errorHandling        # Error management
│   │   ├── state                # Global state management
│   │   └── editorService        # Editor state and operations
│   └── styles/                   # Theme and styling
└── shared/                       # Shared utilities and types
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Main Process (Electron)
- Handles file system operations
- Manages application windows
- Coordinates IPC communication

### Renderer Process (React)
- Implements the user interface
- Manages editor state
- Handles XML validation
- Provides real-time feedback

### Core Components

#### Editor Service
- Manages Monaco Editor instance
- Handles XML parsing and formatting
- Coordinates with validation service

#### Schema Service
- XSD schema loading and parsing
- Real-time validation
- Error reporting

#### IPC Service
- Manages communication between main and renderer processes
- Handles file operations
- Coordinates system events

## Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Tech Stack
- React
- TypeScript
- Electron
- Monaco Editor
- Tailwind CSS
- Shadcn UI