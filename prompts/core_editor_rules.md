# [XML Editor Project Structure]

Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the rule description to a single word or phrase.

## Project Context
A modern web-based XML viewer/editor specifically designed for SWIFT message XML files, featuring:
- IDE-style interface with multiple synchronized views
- XSD validation
- Documentation integration
- Monaco Editor integration as the core editing component

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Apply typescript best practices
- Use Powershell for terminal command
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Structure repository files as follows:

# XML Editor Project Structure

src/
├── resources/						# xsd folder resources
├── main/
│   ├── index.ts                    # Main electron process
│   ├── services/
│   │   ├── fileSystem.ts           # File operations service
│   │   └── ipc.ts                  # IPC handlers
│   └── window.ts                   # Window management
├── renderer/
│   ├── App.tsx                     # Main React component
│   ├── index.tsx                   # Renderer entry point
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── MonacoEditor.tsx    # Monaco editor wrapper
│   │   │   ├── validation.ts       # XML validation logic
│   │   │   └── schema.ts           # Schema handling
│   │   ├── Layout/
│   │   │   ├── ThreePanel.tsx      # Main layout component
│   │   │   ├── Explorer.tsx        # File explorer panel
│   │   │   └── Properties.tsx      # Properties panel
│   │   ├── Toolbar/
│   │   │   ├── index.tsx           # Main toolbar
│   │   │   └── buttons.tsx         # Toolbar buttons
│   │   └── StatusBar/
│   │       └── index.tsx           # Status bar component
│   ├── services/
│   │   ├── errorHandling.ts        # Error logging service
│   │   ├── state.ts                # Global state management
│   │   └── editorService.ts        # Editor state management
│   ├── styles/
│   │   └── theme.css               # Theme definitions
│   └── types/
│       └── index.ts                # TypeScript definitions
├── shared/
│   └── types/                      # Shared type definitions
└── lib/
    └── shadcn/                     # Shadcn UI components

# Configuration Files
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.json5
└── tailwind.config.js

## Tech Stack
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Express.js

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