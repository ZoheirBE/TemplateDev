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
- Use path aliases for imports: `@/*` for src directory and `shared/*` for shared directory
- Avoid try/catch blocks unless there's good reason to translate or handle error in that abstraction
- Use explicit return types for all functions

## State Management
- Use React Context with TypeScript for type-safe state management
- Implement reducer pattern with discriminated union action types
- Maintain editor state with `EditorProvider` and `useEditor` hook
- Use singleton services for cross-component state (e.g., `SyncService`, `FileWatcherService`)
- Implement proper cleanup in useEffect hooks with return functions

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
├── lib/                           # Library utilities and helpers
├── main/                          # Electron main process
│   ├── index.ts                   # Main entry point
│   ├── ipcHandlers.ts            # IPC communication setup
│   ├── menu.ts                   # Application menu configuration
│   └── services/                 # Main process services
│       ├── ipc.ts               # IPC service implementation
├── preload/                      # Preload scripts for IPC bridge
├── renderer/                     # Frontend application
│   ├── App.tsx                   # Root React component
│   ├── index.tsx                 # Renderer entry point
│   ├── components/
│   │   ├── Layout/              # Core layout components
│   │   │   ├── ThreePanel       # Main three-panel layout
│   │   │   ├── Explorer         # File system explorer
│   │   │   └── Properties       # XML properties panel
│   │   ├── Toolbar/            # Application toolbar
│   │   └── ui/                 # Shared UI components
│   ├── services/               # Frontend services
│   │   ├── editorService      # Editor state management
│   │   ├── errorService       # Error handling
│   │   ├── fileWatcherService # File system watching
│   │   ├── ipcService         # IPC communication
│   │   ├── schemaService      # XML schema handling
│   │   └── syncService        # File synchronization
│   └── types/                 # TypeScript type definitions
├── resources/                  # Static resources
├── services/                  # Shared services
├── shared/                    # Shared utilities and types
└── types/                    # Global type definitions
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Main Process (Electron)
- Handles file system operations and window management
- Implements IPC communication handlers
- Manages application menu and system integration
- Provides secure preload scripts for renderer process

### Renderer Process (React)
- Implements modern React components with TypeScript
- Uses service-based architecture for core functionality
- Manages file synchronization and watching
- Provides real-time XML validation

### Core Services

#### Editor Service
- Manages editor state and operations
- Handles file content synchronization
- Coordinates with Monaco Editor instance

#### Schema Service
- Manages XML schema loading and caching
- Provides schema validation
- Handles documentation parsing

#### Sync Service
- Manages file synchronization
- Handles file change notifications
- Coordinates with file watcher service

#### IPC Service
- Provides type-safe IPC communication
- Handles file operations
- Manages error handling and responses

#### File Watcher Service
- Monitors file system changes
- Provides real-time file updates
- Manages file watching lifecycle

#### Error Service
- Centralizes error handling
- Provides user-friendly error messages
- Manages error logging and reporting

## Development

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Windows, macOS, or Linux operating system

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
- Electron
- React
- TypeScript
- Monaco Editor
- Tailwind CSS
- Shadcn UI
- Radix UI