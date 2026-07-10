# Repository Guidelines

## Architecture

This is a Next.js 16 Pages Router application using React 19, JavaScript, CSS Modules, Framer Motion, and react-draggable. `pages/index.js` owns workspace state and responsive orchestration. Interactive window contents live in `components/`; pure Tetris rules live in `components/tetrisLogic.js`. Static assets belong in `public/images/`.

Large screens (at least 1280px wide and 900px tall) use bounded draggable windows. Smaller or shorter screens use normal document flow. Preserve that split when changing layout behavior, and keep hidden games or media from consuming global input or background work.

## Commands

- `pnpm setup` installs dependencies and Playwright Chromium for a clean checkout.
- `pnpm dev` starts local development on port 3000.
- `pnpm lint` runs ESLint with zero warnings allowed.
- `pnpm test` runs Jest and Testing Library.
- `pnpm build` creates the production build.
- `pnpm test:browser` tests a dedicated production server on port 3200.
- `pnpm perf` checks desktop/mobile Web Vitals and layout budgets on port 3100.
- `pnpm verify` runs the complete quality gate.

## Conventions

Use React function components and hooks, two-space indentation, single quotes, and no semicolons unless required. Keep page route files lowercase and reusable components PascalCase. Prefer semantic HTML and controls with at least 44px touch targets. Respect reduced motion, avoid `transition: all`, provide visible focus states, and do not fake network-backed success states.

Keep component tests beside source in `components/__tests__/` and browser flows in `tests/`. Add focused coverage for reducer branches, keyboard behavior, persistence, responsive bounds, and user-visible workflows. Every change must leave `pnpm verify` green.

Document new environment variables in `.env.example`. Prefer `next/image` with stable dimensions for responsive media. Keep deployment commands aligned with the full verification gate.
