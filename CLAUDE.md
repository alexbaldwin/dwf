# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application featuring an interactive draggable workspace with cards containing portraits and a playable Tetris game. The project uses React 19, react-draggable for card interactions, and CSS modules for styling.

## Development Commands

### Essential Commands
- `npm install` - Install dependencies (use npm to keep package-lock.json authoritative)
- `npm run dev` - Start development server on http://localhost:3000 with live reloading
- `npm run build` - Generate optimized production bundle
- `npm run start` - Serve production build locally for smoke testing
- `npm run lint` - Run ESLint with Next.js preset; treat warnings as blockers

## Architecture

### Project Structure
- `pages/` - Next.js route entry points (pages router, not app router)
  - `index.js` - Main page with draggable workspace
  - `_app.js` - Global app wrapper that imports styles
  - `api/` - API route stubs
- `components/` - Reusable React components
  - `tetris.jsx` - Full Tetris game implementation with React hooks
- `styles/` - CSS modules for component styling
  - `globals.css` - Global styles
  - `Home.module.css` - Home page styles
  - `Tetris.module.css` - Tetris component styles
- `public/` - Static assets
  - `images/` - Image files (portraits, logo)

### Key Technical Patterns

**Draggable Cards**: Uses `react-draggable` with the following pattern:
- Create a ref for each draggable element using `useRef`
- Wrap content in `<Draggable>` with `nodeRef` prop
- Set `handle=".handle"` to specify drag handle class
- Use `grid={[25, 25]}` for 25px snap-to-grid behavior
- Apply ref to the immediate child div

**Dynamic Imports**: Components that use browser-only APIs (like Tetris with keyboard events) are imported dynamically:
```javascript
const Tetris = dynamic(() => import("../components/tetris"), {
  ssr: false,
});
```

**Tetris Game Architecture**:
- Pure functions for game logic (collision detection, piece rotation, line clearing)
- React hooks for state management (board, active piece, score, level)
- Custom `useInterval` hook for game loop timing
- Ghost piece preview shows landing position
- Keyboard controls via global event listener in useEffect

### Configuration

**Next.js Config**: `reactStrictMode` is currently disabled in `next.config.js`. If hardening stateful components or adding new features with complex effects, consider re-enabling it.

**ESLint**: Uses Next.js core-web-vitals preset with flat config format. The `.next/` directory is ignored.

## Styling Conventions

- Use CSS Modules for component-specific styles (`.module.css` files)
- Two-space indentation throughout
- Single quotes preferred in JavaScript
- Omit semicolons unless syntax requires them
- Break JSX attributes onto separate lines when props exceed 1-2 items
- Component files use PascalCase (`Tetris.jsx`)
- Page files use lowercase route form (`index.js`)

## Asset Management

- Keep images in `public/images/`
- Compress images before committing
- Prefer `next/image` component for responsive loading with width/height specified
- When using standard `img` tags, always set width and height to prevent layout shift

## Commit Conventions

Follow existing commit style:
- Short, present-tense, imperative messages (~60 chars)
- Direct and clear intent (e.g., "Tetris demo", "Dithered images", "show the actual buttons for now")
- No emoji or decorative elements
