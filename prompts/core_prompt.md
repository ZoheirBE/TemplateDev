Please help me create the core infrastructure for a Windows desktop XML editor application. Focus on setting up the following components:

1. Project Setup:
- Initialize an Electron + Vite project with React, TypeScript, and Tailwind CSS
- Configure hot reload for development
- Set up the main and renderer process structure
- Implement Shadcn UI integration

2. File System Service:
- Create a service for handling single XML file operations (open, save, watch)
- Implement a recent files manager that persists between sessions using Electron's storage
- Add file change watching for the currently opened file
- Include basic file validation before opening

3. State Management:
- Implement global state management for:
  - Current file information (path, content, dirty state)
  - Editor preferences (font size, theme, word wrap, line numbers, minimap, indentation)
  - Layout settings (panel sizes, window position, toolbar visibility)
  - Recent files list
  - Application status (validation state, transformation state)
- Ensure state persistence between sessions for preferences
- Implement proper state initialization and loading

4. Error Handling:
- Create a centralized error logging service that:
  - Logs to both UI and file system
  - Implements proper error boundaries in React
  - Provides user-friendly error messages
  - Maintains error history

5. IPC Communication:
- Set up communication patterns between main and renderer processes for:
  - File operations
  - State updates
  - Error reporting
  - Window management

Technical Requirements:
- Use TypeScript with strict mode
- Implement proper type definitions for all interfaces
- Use React 18+ features
- Utilize Electron's latest stable APIs
- Follow proper separation of concerns
- Implement proper cleanup and resource management

The code should be:
- Well-structured and maintainable
- Properly typed with TypeScript
- Following best practices for each technology
- Properly commented where necessary
- Include error handling
- Include basic tests