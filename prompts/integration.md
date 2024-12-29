Please help me implement the integration and synchronization features for an XML editor application with the following requirements:

1. View Synchronization:
- Automatically update properties panel when editor content changes
- Sync file explorer with filesystem changes
- Implement scroll synchronization between different views showing the same content
- Ensure all panels reflect the current state of the file consistently

2. Real-time Updates:
- Implement reactive updates from editor changes to all panels
- Update validation status, documentation, and schema information in real-time
- Ensure editor content stays synchronized with current file state
- Push updates to all relevant panels (explorer, properties, status bar)
- Status bar should always show current file state

3. File Watching:
- Implement file watching for currently opened file using Electron's file watching APIs
- Handle external file changes with these options:
  * Auto-reload external changes when file has no unsaved changes
  * Show notification dialog when file has unsaved changes
  * Allow user to choose between reloading or keeping current version
- Show save prompt if watched file is deleted while open
- Maintain proper cleanup of file watchers when switching files

4. Error Handling:
- Implement dual-logging system:
  * Local rotating log files with error details and stack traces
  * UI error display appropriate to error type
- Handle different error types appropriately:
  * Validation errors: Display using Monaco editor markers
  * Runtime errors: Show in status bar and/or notification system
  * Critical errors: Display using modal dialogs
- Implement proper error boundaries for each panel
- Ensure errors in one panel don't crash others

5. Editor State Management:
- Implement undo/redo stack for XML editor
- Maintain proper dirty state tracking
- Handle proper state cleanup when switching files
- Ensure state consistency across all views

Technical Requirements:
- Use TypeScript with strict mode
- Implement proper cleanup for all subscriptions and watchers
- Handle all error cases gracefully
- Maintain proper type definitions for all interfaces
- Follow proper separation of concerns
- Implement proper cleanup and disposal of resources
- Handle edge cases (file deletion, permission changes, etc.)
- Ensure proper memory management