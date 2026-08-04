# Phase 2.5 visual remediation

Implementation date: 2026-08-04.

Phase 2.5 remediates the readability of the existing historical galaxy. It does
not add narrative progression or infer relationships. The diagnosis and
untouched evidence are preserved in the
[Phase 2 visual audit](phase-2-visual-audit.md).

## Verified screenshots

| View | Before | After |
| --- | --- | --- |
| Desktop, 1440 × 900 | [Baseline](screenshots/phase-2-before-desktop.png) | [Remediated](screenshots/noesis-galaxy-desktop.png) |
| Tablet, 1024 × 768 | [Baseline](screenshots/phase-2-before-tablet.png) | [Remediated](screenshots/noesis-galaxy-tablet.png) |
| Mobile, 390 × 844 | [Baseline](screenshots/phase-2-before-mobile.png) | [Remediated](screenshots/noesis-galaxy-mobile.png) |
| Selected philosopher | — | [Adam Smith selected](screenshots/noesis-galaxy-selected-philosopher.png) |

The captures use Playwright 1.62.1 and its installed Chromium build against the
real public API. Each final overview reported 114 positioned nodes, a full
viewport WebGL2 canvas, no horizontal overflow, and no uncaught page or console
errors. The images were manually inspected after capture.

## Why Phase 2 appeared empty

The scene contained data, but its framing and rendering worked against it:

- 0.13-unit standard-material spheres were viewed from hard-coded distances of
  32, 44, and 72 units.
- Mobile placed the camera beyond the fog's fully opaque distance of 52.
- The first-load Canvas wrapper reduced the entire scene to 0.58 opacity.
- The camera targeted x = 2.5 even though the real node bounds center is near
  x = -0.885.
- Dim philosopher spheres and 700 decorative stars shared the same dot-like
  vocabulary.
- 9px scene labels were reduced again by distance scaling.
- The historical spine and boundaries were too thin and translucent to read.

The measured 114-node bounds are x -9.280 to 7.510, y -4.158 to 4.697, and z
-1.760 to 1.804.

## Bounds-driven camera framing

calculateGalaxyBounds derives min, max, center, and size once from the memoized
philosopher positions. calculateOverviewCamera fits that box to the current
aspect ratio and 42-degree vertical field of view with centralized viewport
padding. Reset uses the same calculation.

The verified live-data overview distances are:

| Viewport | Previous | Remediated |
| --- | ---: | ---: |
| 1440 × 900 | 32 | 18.091 |
| 1024 × 768 | 44 | 20.497 |
| 390 × 844 | 72 | 52.004 |

Mobile still requires more world-space distance than desktop to fit the entire
horizontal chronology into a portrait viewport, but it is substantially closer
than before and receives larger semantic nodes. Fog now begins five units
behind the fitted semantic layer instead of in front of it.

## Semantic nodes and decorative stars

Philosopher nodes use two shared instanced meshes:

1. A shader-free ivory MeshBasicMaterial core.
2. A cool translucent additive halo.

The core remains equally important for every philosopher. Viewport quality
changes apparent scale, not fame or importance. Hover adds a clear ring plus a
fixed-size name/lifespan label. Selection adds a warm core glow, two strong
procedural rings, a birth-year projection, camera focus, and the existing DOM
summary. Other nodes remain visible and become slightly smaller.

Decorative atmosphere uses two deterministic point layers with 380 desktop,
260 tablet, or 150 mobile particles. They are smaller, dimmer, and behind the
historical layer. No portrait textures are used in WebGL.

## Historical spine and era regions

The revised spine is a perceptible horizontal light path with BCE/Antiquity and
Present/CE endpoints. Era boundaries are thicker, and every represented era has
a very low-opacity plane behind the philosophers. Fixed-size text labels and
the DOM direction legend make the sequence readable without relying on color:

Ancient → Medieval → Early modern → Modern → Contemporary

The selected philosopher projects to the spine with a warm year marker. These
regions are broad orientation aids, not universal periodization claims.

## School cluster presentation

Groups with at least four records may receive a restrained ellipse and label.
Ellipses are capped in size so schools spanning many centuries do not create
screen-filling shapes. The responsive limit is four labels on desktop, three
on tablet, and one on mobile. They indicate shared normalized school metadata
only; they do not encode influence, lineage, agreement, or relationships.

## Responsive quality rules

One getSceneQuality function owns:

- decorative point count;
- semantic node scale;
- halo multiplier;
- visible school-label limit;
- overview padding;
- selection distance;
- mobile selection target offset.

Mobile retains a full-height Canvas, larger apparent nodes, fewer decorative
points, one truncated-safe school label, tap-capable semantic cores, compact
controls, and a scrollable detail sheet capped at 48% of the viewport height.
The close action remains in view.

## Loading and error behavior

The Canvas is still lazy. Until validated data and scene telemetry agree, an
explanatory Noesis Galaxy loading card reports either “Connecting to the
archive” or the real number of thinkers being positioned. The indeterminate
line does not claim a fake percentage and becomes static under reduced motion.

Collection failures show an explicit explanation and retry control. The
accessible explorer remains outside the Canvas, and WebGL failure retains its
existing non-WebGL guidance.

## Selection and state

URL selection remains the source of truth. Direct Canvas click/tap and the
accessible explorer both update it. The camera transition is request-guarded so
an older overview animation cannot overwrite newer selected telemetry. Closing
or Reset View clears selection and returns to the bounds-derived overview.

Development/E2E builds expose a small
window.__NOESIS_GALAXY_TELEMETRY__ object containing counts, historical bounds,
camera distance, overview state, selected ID, and one safe projected interaction
target. Production does not expose a debug panel.

## Accessibility and reduced motion

The semantic modal explorer, focus management, URL synchronization, keyboard
selection, textual lifespans, school labels, and WebGL-independent fallback are
preserved. The visible DOM legend explains the encoding. Reduced motion keeps
camera moves immediate and disables loading animation.

## Browser verification

Fourteen Playwright Chromium tests use 114 deterministic sanitized fixture
records and intercepted collection/detail requests. They verify loading, scene
readiness, Canvas dimensions, telemetry, historical orientation, accessible
selection, direct Canvas selection, selected detail, URL synchronization,
reset, invalid IDs, mobile controls and overflow, uncaught errors, and reduced
motion. The separate API smoke continues to validate the live service.

## Performance impact

| Asset | Phase 2 | Phase 2.5 |
| --- | ---: | ---: |
| Initial JS | 498.86 kB / 154.09 kB gzip | 499.90 kB / 154.51 kB gzip |
| Lazy galaxy JS | 942.68 kB / 249.96 kB gzip | 947.64 kB / 251.16 kB gzip |
| CSS | 46.18 kB / 8.45 kB gzip | 48.26 kB / 9.35 kB gzip |

The only new dependency is development-only @playwright/test 1.62.1. No
runtime package was added. Vite's existing >500 kB advisory remains limited to
the lazy Three.js chunk.

## Postprocessing decision

No postprocessing dependency was added. Bounds-correct framing, unlit semantic
cores, one additive instanced halo, clearer guides, and restrained contrast
produce the required hierarchy without bloom, vignette, or additional runtime
weight.

## Remaining visual limitations

- Dense late-modern and contemporary dates genuinely overlap because many
  records share compressed years and only bounded school offsets are used.
- Fixed-size scene labels can still approach viewport edges after free camera
  rotation; default mobile labels are reduced and truncated safely.
- WebGL screenshots are verified in Chromium only, not Firefox or WebKit.
- Exact visual appearance can vary slightly with GPU/driver antialiasing.

Phase 3 may build a scroll-driven historical narrative on this foundation, but
no Phase 3 behavior is present here.
