# Noesis Galaxy

An interactive Three.js journey through philosophers, ideas, history, and
contradictions.

## Status

**Phase 1 — Philosophers API Data Foundation** is implemented. The application
retains its Phase 0 full-screen React Three Fiber shell and now includes a small
development-facing diagnostics panel backed by validated live data.

Phase 1 adds transport schemas, normalized application models, historical year
and image URL normalization, bounded coordinates, a typed fetch client, and
reusable TanStack Query options. It does not render API data in the galaxy.

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
- Zod, Zustand, Motion, and Lucide React
- ESLint 10
- Vitest and React Testing Library
- pnpm 10

## Requirements

- Node.js 22.12 or newer; Node.js 24 is used in CI
- pnpm 10.30.0 (recorded in `packageManager`)

## Installation

```powershell
git clone https://github.com/alicanyayl/noesis-galaxy.git
cd noesis-galaxy
pnpm install
pnpm dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check application code and create a production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint with zero warnings allowed |
| `pnpm typecheck` | Type-check application, scripts, and test code |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test:run` | Run the offline unit suite once |
| `pnpm api:smoke` | Fetch and validate the live philosopher collection |
| `pnpm check` | Run lint, type-checking, tests, and the production build |

## Philosophers API foundation

The official REST base URL is `https://philosophersapi.com/api`. The public API
does not require a key and permits direct browser requests with
`Access-Control-Allow-Origin: *`, so the app uses REST directly without a
proxy. The official GraphQL endpoint is available, but Phase 1 uses REST for a
smaller and clearer data boundary.

Validated entities include philosopher summaries and details, key-idea
summaries and details, categories, quotes, works, image references, birth
locations, and explicit relationship IDs. Responses are validated as raw API
models and then normalized and validated again for application use.

BC/BCE years become negative numbers and AD/CE years become positive numbers;
the original string and era are retained. `Present`, unknown, blank, and invalid
values never receive an invented numeric year. Relative image paths resolve
through one safe official-origin resolver, while unsafe protocols are rejected.
Latitude and longitude accept finite numbers or numeric strings and must remain
within geographic bounds.

A philosopher's birth and death years are intentionally separate from key-idea
ownership, categories, agreement IDs, and disagreement IDs. Phase 1 does not
assume that an idea ends when its philosopher dies.

See [the Phase 0 audit](docs/phase-0-audit.md) and
[the Phase 1 data notes](docs/phase-1-data-foundation.md) for verified endpoint
behavior, schema boundaries, query keys, errors, and known inconsistencies.

## Current structure

```text
src/
├── api/philosophers/       # REST client, Zod schemas, normalizers, queries
├── app/                    # Providers and type-safe router
├── components/             # Application layout and shadcn/Base UI
├── features/
│   ├── data-diagnostics/   # Minimal Phase 1 connection summary
│   └── galaxy/             # Phase 0 Canvas and verification scene
├── lib/                    # Shared utilities
├── routes/                 # Root and not-found route UI
└── stores/                 # Small client-only experience state
scripts/                    # Opt-in live API smoke validation
tests/                      # Network-independent unit and UI tests
docs/                       # Audit, architecture, and scope notes
```

Fetched API data remains TanStack Query server state and is not copied into
Zustand. The diagnostics panel intentionally requests only philosopher and
category collections. Detail requests are exposed as reusable query options and
are not triggered on initial load.

## Roadmap

- [x] Phase 0: Foundation
- [x] Phase 1: Philosophers API data foundation
- [ ] Phase 2: Historical galaxy
- [ ] Phase 3: Scroll-driven narrative
- [ ] Phase 4: Philosopher encounters
- [ ] Phase 5: Branching journeys
- [ ] Phase 6: Agreement and contradiction
- [ ] Phase 7: Visual polish and accessibility
- [ ] Phase 8: Testing and release

## Phase 1 limitations

Historical galaxy positioning, timeline rendering, scroll-driven storytelling,
branching questions, philosopher encounter scenes, idea-clash views,
agreement/disagreement rendering, complex shaders, postprocessing, imported 3D
models, audio, React Bits effects, authentication, databases, and backend
services remain unimplemented. The central object and stars are still only the
procedural Phase 0 WebGL verification scene.

## License

MIT. See [LICENSE](LICENSE).
