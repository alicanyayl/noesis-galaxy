# Phase 2.75 visual finalization

Finalized on 2026-08-05 from the Phase 2 redesign at `89a8c5d`. This document
records the approved visual rescue and closes the portfolio phase. It does not
implement Phase 3.

## Why the earlier direction was rejected

The unfinished Phase 2.75 direction made philosopher nodes read as flat,
uniform interface markers. Weak, fragmented arms left the galaxy without a
convincing center of gravity, while repeated focus rings, spokes, labels, and
animated relationship markers pushed the selected view toward a radial
dashboard. The mobile detail sheet also consumed too much of the scene.

The final pass retained the deterministic data and camera foundations but
replaced that presentation with a quieter astronomical hierarchy.

## Approved galaxy composition

The ancient region is a compact luminous core surrounded by three soft spiral
dust arms. Fine particles provide structure, larger low-opacity points create
haze, and z displacement establishes foreground and background overlap. The
arms remain visual context: only the primary historical scalar encodes
chronological order.

The background has three shared round-point layers:

| Viewport | Distant | Mid-distance | Rare bright | Total |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 3,200 | 900 | 48 | 4,148 |
| Tablet | 2,000 | 560 | 32 | 2,592 |
| Mobile | 1,100 | 300 | 18 | 1,418 |

Each point receives a deterministic cool, neutral, or warm temperature. The
rare bright layer is intentionally sparse. Small overview-only supernova
landmarks remain environmental accents and disappear during focus and on
mobile.

## Shaded philosopher bodies

All philosopher bodies share one instanced sphere geometry and shader material.
Per-instance buffers provide body color, surface seed, roughness, and atmosphere
strength. Directional light creates a readable day and shadow side; a restrained
specular highlight and view-dependent rim preserve the spherical silhouette.
Procedural low-amplitude noise prevents identical plastic surfaces without
textures or per-node materials.

Equal base importance is preserved. Metadata may choose a subtle ring, corona,
or companion accent, but it never changes philosophical rank and does not
replace the common shaded body system.

## Philosopher, idea, and relationship focus

A selected philosopher becomes the center of a small solar system. At most five
ideas are visible on desktop and four on mobile. Only the nearest orbiting idea
receives a scene label; the HTML detail panel remains the complete readable
list. Orbit paths are faint and limited, and owner lines start outside the
central body instead of crossing it.

No global relationship web is rendered. Selecting an idea requests its detail
record and reveals only explicit `agreeingKeyIdeas` and
`disagreeingKeyIdeas`. The initial view is capped at three relationships of each
kind, with twelve total available through deliberate expansion. Continuous cool
curves encode agreement; dashed warm curves encode disagreement. The rejected
moving edge-marker flood is absent.

## Camera and wheel behavior

Drei `CameraControls` owns `galaxy-overview`, `philosopher-focus`, and
`idea-focus` modes. Programmatic transitions occur only for initial scene
population, semantic selection changes, and reset. Ordinary React renders and
wheel events do not reapply `setLookAt`.

- `dollyToCursor`: `false`
- dolly speed: `0.34`
- smooth time: `0.22`
- dragging smooth time: `0.06`
- desktop philosopher distance: `6.25` (`4.0–9.5`)
- mobile philosopher distance: `8.1` (`5.184–12.312`)

The approved Chromium wheel sequence moved overview distance from `17.0099` to
`14.2877` and back to `17.0099`. Philosopher focus moved from `6.2500` to
`5.8970` and back. Semantic target drift stayed below `0.001`, document scroll
remained zero, and no direction reversal or rubber-band oscillation appeared.

## Mobile and accessibility

At 390×844 the detail panel is a scrollable bottom sheet capped at 42svh. Scene
labels and focus controls that would compete with the selected body are hidden,
while the portrait, close action, metadata, and idea list remain reachable.

The focus-managed accessible explorer represents the same normalized records
as HTML and is keyboard operable. It remains available when WebGL support is
missing or the Canvas error boundary falls back. Reduced-motion preference
freezes repeated scene motion and makes camera transitions immediate without
removing semantic content.

## Performance

The final production build measures:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Initial JavaScript | 499.87 kB | 155.10 kB |
| Lazy galaxy JavaScript | 988.98 kB | 263.14 kB |
| Lazy philosopher summary | 8.15 kB | 2.72 kB |
| CSS | 55.34 kB | 10.75 kB |

Final Chromium telemetry measured 22 overview draw calls, 38 desktop
philosopher-focus draw calls, and 34 mobile philosopher-focus draw calls. The
overview requests no portraits; a focused philosopher requests one portrait
shared through the browser cache. Vite continues to report its expected
`>500 kB` advisory for the lazy Three.js galaxy chunk.

## Final visual evidence

- [Overview](screenshots/noesis-galaxy-overview.png), 1440×1000
- [Philosopher focus](screenshots/noesis-galaxy-philosopher.png), 1440×1000
- [Mobile focus](screenshots/noesis-galaxy-mobile.png), 390×844
- Approved source captures remain as `review-v2-overview.png`,
  `review-v2-philosopher-focus.png`, and `review-v2-mobile.png`.

## Remaining limitations

- Visual QA and automated browser coverage target Chromium only.
- The live experience depends on the external Philosophers API; deterministic
  fixtures cover local and CI browser tests separately.
- HTML labels can approach the viewport edge after aggressive free orbit.
- The lazy Three.js chunk remains above Vite's advisory threshold.

No scroll-driven chapters, branching questions, audio, maps, authentication,
database, persistence, backend service, deployment, or inferred relationship
type was added during finalization.
