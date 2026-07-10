# Project Guidance

Follow `AGENTS.md` as the canonical repository guide.

The application is a Next.js 16 Pages Router creative desktop. `pages/index.js` orchestrates responsive windows; reusable interactions are isolated in `components/`; Tetris rules are pure functions in `components/tetrisLogic.js`; styles use CSS Modules and global theme tokens.

Use pnpm through Corepack. Run `pnpm verify` before shipping. Browser tests run against a dedicated production server, and the performance check enforces desktop/mobile Web Vitals, bounds, overflow, and overlap budgets.
