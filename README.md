# Dinner with Friends

An interactive creative desktop built with Next.js Pages Router and React. The wide layout behaves like a draggable desktop; tablet and mobile layouts become an ordered, touch-friendly document flow.

## Setup

Use Node 24 LTS (or a supported Node 22 release) and the pnpm version declared by `packageManager` in `package.json`.

```bash
corepack enable
pnpm setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `pnpm setup` installs packages and the Chromium binary required by the browser and performance checks.

## Features

- Draggable, focusable, minimizable desktop windows on wide screens
- Responsive tablet and mobile layouts without overlapping content
- Persistent light and dark themes
- Bill splitting calculator with guest and tip controls
- Local portrait gallery and browser-persisted contact draft
- User-initiated Web Audio dinner radio
- Playable Tetris with keyboard, pointer, and touch controls

## Verification

```bash
pnpm lint          # ESLint, with zero warnings allowed
pnpm test          # Jest and Testing Library
pnpm build         # Optimized Next.js production build
pnpm test:browser  # Playwright against a dedicated production server
pnpm perf          # Desktop/mobile Web Vitals and layout budgets
pnpm verify        # Complete local quality gate
```

The performance gate checks production FCP, LCP, CLS, load time, critical image loading, horizontal overflow, window bounds, and surface overlap. Screenshots are written to `.perf/` for inspection.

## Structure

- `pages/index.js`: workspace state, navigation, responsive window orchestration
- `components/`: window primitives and complete interactive features
- `components/tetrisLogic.js`: pure Tetris reducer and game rules
- `styles/`: global theme tokens and scoped CSS Modules
- `tests/`: production browser behavior and layout checks
- `scripts/performance-check.mjs`: production performance budget

Optional performance harness overrides are documented in `.env.example`.
