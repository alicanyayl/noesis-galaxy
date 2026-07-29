# Noesis Galaxy

An interactive Three.js journey through philosophers, ideas, history, and
contradictions.

## Status

**Phase 0 — Foundation** is implemented. The repository currently provides the
development environment, application shell, type-safe root routing, data-client
provider, Base UI control foundation, accessible error states, and a lightweight
React Three Fiber verification scene.

No philosopher data or product-level exploration features are implemented yet.

## Long-term concept

Noesis Galaxy is intended to become a navigable philosophical universe:
philosophers as celestial nodes, schools as constellations, ideas as orbiting
objects, and agreements or contradictions as visible relationships. Historical
storytelling and branching questions will eventually shape a visitor's route
through that universe.

## Technology

- React 19 and TypeScript 6
- Vite 8 and Tailwind CSS 4
- shadcn/ui with the Base UI foundation
- Three.js, React Three Fiber, and Drei
- TanStack Router and TanStack Query
- Zustand, Zod, Motion, and Lucide React
- ESLint 10
- Vitest and React Testing Library
- pnpm 10

## Requirements

- Node.js 22.12 or newer; Node.js 24 LTS is used in CI
- pnpm 10.30.0 (recorded in `packageManager`)

## Installation

```powershell
git clone <repository-url>
cd noesis-galaxy
pnpm install
pnpm dev
```

Vite prints the local development URL after startup.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check application code and create a production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint with zero warnings allowed |
| `pnpm typecheck` | Type-check application and test code |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test:run` | Run the unit suite once |
| `pnpm check` | Run lint, type-checking, tests, and the production build |

## Current structure

```text
src/
├── app/                    # Providers and type-safe router
├── components/
│   ├── layout/             # Application-level boundaries
│   └── ui/                 # shadcn/Base UI components
├── features/
│   └── galaxy/
│       ├── components/     # Canvas and WebGL fallback
│       └── scene/          # Minimal R3F verification scene
├── lib/                    # Shared utilities
├── routes/                 # Root and not-found route UI
├── stores/                 # Small client-only experience state
├── App.tsx
├── index.css
└── main.tsx
tests/                      # Stable DOM-focused foundation tests
docs/                       # Foundation decisions and scope notes
.github/workflows/          # Continuous integration
```

The Three.js scene is intentionally isolated from route and shell logic so DOM
tests do not need to emulate WebGL.

## Roadmap

- [x] Phase 0: Foundation
- [ ] Phase 1: Philosophers API data layer
- [ ] Phase 2: Historical galaxy
- [ ] Phase 3: Scroll-driven narrative
- [ ] Phase 4: Philosopher encounters
- [ ] Phase 5: Branching journeys
- [ ] Phase 6: Agreement and contradiction
- [ ] Phase 7: Visual polish and accessibility
- [ ] Phase 8: Testing and release

## Not implemented

Phase 0 deliberately excludes philosophers API requests and data, historical
positioning, timelines, scroll-driven storytelling, branching questions,
agreement or contradiction relationships, complex shaders, postprocessing,
imported 3D models, audio, and React Bits effects.

The central object and stars are only a small procedural verification that the
WebGL foundation works.

## License

MIT. See [LICENSE](LICENSE).
