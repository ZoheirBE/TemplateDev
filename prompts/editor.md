Thank you for those clarifications. Let me prepare a detailed prompt for the Editor Implementation phase:

Please help me implement the Monaco Editor component for an XML editor application with the following requirements:

1. Monaco Editor Core Setup:
- Integrate Monaco Editor within the existing Electron + React application
- Configure for XML syntax highlighting
- Set up for single file editing (no tabs needed)
- Implement basic editor preferences (inherited from core setup)
- Handle proper cleanup and disposal of editor instances

2. XML Validation:
- Implement real-time well-formedness validation
- Display validation errors using Monaco's marker system
- Provide clear error messages within the editor
- Ensure validation runs on content changes
- Handle validation state updates to the main application state

3. Schema Support:
- Implement XSD and DTD schema association
- Auto-detect schema references from XML files
- First check resources folder for referenced schemas
- Fall back to referenced URIs if not found locally
- Add schema documentation support that displays:
  - Element descriptions
  - Attribute information
  - Type definitions
  - Available child elements

4. Editor Services:
- Implement proper file content loading and updating
- Handle dirty state tracking
- Implement proper state synchronization with main application
- Add proper error boundaries and error handling

Technical Requirements:
- Use TypeScript with strict mode
- Proper type definitions for all interfaces
- Clean separation of concerns
- Proper resource management
- Error handling at all levels
- Memory leak prevention