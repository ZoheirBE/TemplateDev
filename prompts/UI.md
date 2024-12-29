Please help me implement the main UI for an XML editor application with the following components and requirements:

1. Three-Panel Layout:
- Implement a resizable three-panel layout (left: explorer, center: editor, right: properties)
- Use `@/components/ui/resizable` for panel resizing
- Persist panel sizes between sessions
- Left and right panels should have fixed minimum/maximum widths
- Main editor panel should have a minimum width

2. File Explorer Panel (Left):
- Implement using `@/components/ui/tree-view`
- Display a directory tree showing all files
- Use distinct icons for XML, XSD and other files
- Single file selection only
- Components needed:
  * `npx shadcn-ui@latest add tree`
  * `npx shadcn-ui@latest add scroll-area` (for scrollable tree)

3. Properties Panel (Right):
- Implement documentation viewer using:
  * `@/components/ui/card` for main container
  * `@/components/ui/tabs` for organizing different types of documentation
  * `@/components/ui/scroll-area` for scrollable content
- Show XSD documentation hierarchically:
  * Element type at top level
  * Description and parameters underneath
- Implementation commands:
  * `npx shadcn-ui@latest add card`
  * `npx shadcn-ui@latest add tabs`

4. Toolbar:
- Implement using `@/components/ui/toolbar`
- Include buttons for:
  * File operations (New, Open, Save)
  * Edit operations (Undo, Redo, Cut, Copy, Paste)
  * XML operations (Format, Validate)
  * View operations (Toggle Theme)
- Use `@/components/ui/button` for toolbar items
- Use `@/components/ui/separator` between button groups
- Use `@/components/ui/tooltip` for button hints
- Implementation commands:
  * `npx shadcn-ui@latest add toolbar`
  * `npx shadcn-ui@latest add button`
  * `npx shadcn-ui@latest add separator`
  * `npx shadcn-ui@latest add tooltip`

5. Status Bar:
- Implement using `@/components/ui/separator` and custom styling
- Display:
  * Current file path
  * XML validation status
  * Cursor position (line/column)
  * Encoding
  * Schema validation status
- Use different colors/icons to indicate status states

6. Theme Support:
- Implement dark/light theme toggle using shadcn's built-in theme support
- Ensure all components respect current theme
- Use `@/components/ui/dropdown-menu` for theme selection
- Implementation command:
  * `npx shadcn-ui@latest add dropdown-menu`

Technical Requirements:
- Use TypeScript with strict mode
- Proper state management for UI state
- Clean separation of concerns
- Proper resource cleanup
- Error handling
- Persist layout preferences using electron storage
- Type definitions for all interfaces and components
- Proper event handling between panels