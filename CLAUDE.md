# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm start` - Run the app in development mode
- `npm test` - Run tests in interactive watch mode
- `npm test -- --testPathPattern=App.test` - Run a single test file
- `npm run build` - Build app for production
- `npm run eject` - Eject from Create React App

## Code Style Guidelines
- **TypeScript**: Use strong typing, define interfaces and types
- **React**: Functional components with hooks preferred over class components
- **Imports**: Group imports by external libraries, then internal modules, then CSS
- **Formatting**: 2-space indentation, 80-character line limit where practical
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **Error Handling**: Use try/catch blocks and log errors appropriately
- **State Management**: Use React hooks (useState, useEffect, useContext) consistently
- **Styling**: Use Tailwind CSS for styling components
- **Testing**: Write tests for components using React Testing Library