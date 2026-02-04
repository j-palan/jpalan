# Personal Portfolio

A single-page personal portfolio built with a modern, polished stack. Features a glass-morphism UI, smooth animations, and responsive layout.

## Sections

- **Hero** — Intro, headline, and primary CTA
- **Skills** — Tech stack and competencies
- **Experience** — Work history and impact
- **Projects** — Featured work with links
- **Contact** — Get in touch
- **Footer** — Links and copyright

## Tech Stack

| Layer        | Tech |
|-------------|------|
| Build       | [Vite](https://vitejs.dev/) 5, [SWC](https://swc.rs/) |
| UI          | [React](https://react.dev/) 18, [TypeScript](https://www.typescriptlang.org/) 5 |
| Routing     | [React Router](https://reactrouter.com/) 6 |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) 3, [Radix UI](https://www.radix-ui.com/) / shadcn-style components |
| Animation   | [Framer Motion](https://www.framer.com/motion/) |
| Icons       | [Lucide React](https://lucide.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Runs the app at `http://localhost:5173` (or the port shown in the terminal).

### Build

```bash
npm run build
```

Output is in `dist/`. Preview the production build:

```bash
npm run preview
```

### Lint & Test

```bash
npm run lint
npm run test
```

## Project Structure

```
src/
├── components/     # Sections and shared UI (Hero, GlassNavbar, etc.)
├── pages/         # Route-level pages (Index, NotFound)
├── lib/           # Utilities (e.g. cn)
├── hooks/         # Custom React hooks
├── index.css      # Global styles and design tokens
└── main.tsx       # Entry point
```

## Customization

- **Content** — Update copy and links in the section components under `src/components/`.
- **Theme** — Colors and spacing are driven by CSS variables in `src/index.css`; adjust `:root` for light/dark or brand colors.
- **Sections** — Add, remove, or reorder sections in `src/pages/Index.tsx`.

## License

Private — all rights reserved.
