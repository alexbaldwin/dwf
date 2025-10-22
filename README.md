## Dinner with Friends — Desktop Playground

This repo powers the interactive “Dinner with Friends” desktop experience built on Next.js.

### Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/) 8.x (project declares `packageManager: pnpm@8.15.5`)

Install once:

```bash
pnpm install
```

### Local Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the draggable windows (Calculator, Images, Email, Tetris, Music). Each window remembers its position and can be minimized/restored via the desktop icons.

Key code entry points:

- `pages/index.js` — desktop layout, window state, dynamic imports
- `components/AnimatedWindow.jsx` — draggable shell with framer-motion transitions
- `components/tetris.jsx` — custom React Tetris implementation
- `styles/*` — global theme tokens plus window-specific styling

### Verification Workflow

```bash
pnpm lint   # ESLint flat config
pnpm build  # Production bundle check
pnpm start  # Optional: serve the build locally
```

Deploy with your preferred platform (e.g., Vercel) by running the same `pnpm build` step in CI before publishing.
