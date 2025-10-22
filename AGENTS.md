# Repository Guidelines

## Project Structure & Module Organization
The Next.js app treats `pages/` as route entry points; `pages/index.js` renders the draggable workspace and `pages/api/` holds API stubs. Reusable UI lives in `components/` (currently `tetris.jsx`), shared styling sits in `styles/`, and static media belongs in `public/` (e.g., `public/images/`). `next.config.js` presently keeps `reactStrictMode` off; revisit that flag if you harden stateful components.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies; pnpm is the required package manager (declared in `package.json`).
- `pnpm dev` — start the Next dev server on port 3000 with live reloading.
- `pnpm build` — generate the optimized production bundle; run before deployment checks.
- `pnpm start` — serve the output of `pnpm build` locally for smoke testing.
- `pnpm lint` — execute the ESLint flat-config suite; treat warnings as blockers.

## Coding Style & Naming Conventions
Stick to React function components with hooks, keeping component files in PascalCase (`NewWidget.jsx`) and page files in lower-case route form (`pages/about.js`). Match the current two-space indentation, prefer single quotes, and omit semicolons unless syntax demands them. Break JSX attributes onto separate lines when props exceed one or two items. Run `pnpm lint` after edits and commit any new formatter configuration alongside code changes.

## Testing Guidelines
No automated tests ship yet, so pair focused manual checks (drag handles, image loads, breakpoints) with a clean `pnpm lint`. When adding coverage, use Jest + React Testing Library, place specs in `__tests__/` near the source, and name them `component.test.jsx`. Prioritize behavior-driven assertions and note coverage expectations in each PR.

## Commit & Pull Request Guidelines
Commit history favors short, direct messages (e.g., “Tetris demo”, “Dithered images”); continue using present-tense, imperative phrasing that explains intent in under ~60 characters. For pull requests, provide a concise summary, testing evidence (commands run or manual steps), links to related issues, and UI screenshots/gifs when visuals change. Rebase on `main`, confirm `pnpm lint` passes, and call out any follow-up work.

## Assets & Configuration Tips
Keep images in `public/images/`, compress before commit, and favor `next/image` for responsive needs; when using `img`, set width and height to avoid layout shift. Limit `ssr: false` dynamic imports to components that truly require browser APIs. Document any new environment variables in `.env.example` before use.
