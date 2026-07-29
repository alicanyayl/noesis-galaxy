# Phase 0 foundation notes

Phase 0 establishes implementation boundaries without pre-building later
features.

## Current decisions

- Vite uses the current React TypeScript template.
- Tailwind CSS 4 runs through `@tailwindcss/vite`; there is no legacy
  `tailwind.config.js`.
- shadcn/ui is configured with `style: "base-nova"` and Base UI. Only Button is
  generated because it is the only Phase 0 control.
- TanStack Router uses a small code-based, type-safe route tree with `/` and a
  root not-found component. No route generation plugin is needed for one route.
- TanStack Query owns future server state. The current `QueryClient` has no
  queries.
- Zustand stores only the local intro/explore presentation mode.
- The React Three Fiber scene is procedural and separated from the application
  shell. It contains fewer than one thousand stars, one placeholder core, basic
  lights, and no postprocessing.
- DOM tests mock the canvas boundary rather than emulating WebGL in jsdom.

## Official setup references

- [Vite getting started](https://vite.dev/guide/)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui for Vite](https://ui.shadcn.com/docs/installation/vite)
- [shadcn CLI options](https://ui.shadcn.com/docs/cli)
- [React Three Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [Drei Stars](https://drei.docs.pmnd.rs/staging/stars)
- [TanStack Router code-based routing](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- [TanStack QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider)

## Deferred scope

Data integration, philosopher types, narrative routes, timelines, idea
relationships, camera journeys, shaders, postprocessing, external assets,
audio, and production analytics remain deferred to their roadmap phases.
