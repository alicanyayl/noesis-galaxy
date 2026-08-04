# Phase 2 visual audit

Audit date: 2026-08-04.

This audit records the untouched Phase 2 scene rendered in Playwright 1.62.1
Chromium with the live Philosophers API. It is based on source measurements and
manual inspection of real WebGL screenshots, not on the earlier documentation's
visual-quality claims.

## Baseline evidence

- [Desktop, 1440 × 900](screenshots/phase-2-before-desktop.png)
- [Tablet, 1024 × 768](screenshots/phase-2-before-tablet.png)
- [Mobile, 390 × 844](screenshots/phase-2-before-mobile.png)

All three captures loaded 114 validated records, created a non-zero full
viewport WebGL2 canvas, and produced no uncaught page or console errors.

## Measured scene

The 114 positioned philosophers occupy these world-space bounds:

| Axis | Minimum | Maximum | Span |
| --- | ---: | ---: | ---: |
| x | -9.280 | 7.510 | 16.790 |
| y | -4.158 | 4.697 | 8.855 |
| z | -1.760 | 1.804 | 3.564 |

The semantic node radius is only 0.13 world units. The guessed overview camera
distances are 32 on desktop, 44 on tablet, and 72 on mobile. The camera targets
x = 2.5 even though the measured node-bound center is approximately x = -0.885.
The environment fog begins at distance 22 and becomes fully opaque at distance
52.

## Concrete findings

### Camera and depth

- The desktop camera frames far more empty space than the 16.79 × 8.86 node
  footprint needs, leaving most nodes as faint specks in the center-right.
- Tablet moves farther away despite the smaller viewport, weakening apparent
  size further.
- Mobile moves behind the fog's far boundary at distance 72, so the semantic
  layer is effectively fog-colored. The baseline mobile screenshot contains no
  clearly identifiable philosopher nodes.
- The hard-coded target shifts the scene away from its measured center. The
  large introductory panel then covers or darkens much of the ancient half.

### Node visibility and contrast

- A 0.13-radius standard-material sphere is too small at the overview
  distances, especially after fog and overlay attenuation.
- The scene wrapper renders at 0.58 opacity before the visitor presses “Enter
  galaxy.” This makes the primary information layer deliberately faint on first
  load.
- Philosopher colors are muted midtones and their emissive contribution is low.
  They do not establish a luminous core or halo, so they resemble dim
  environmental particles.
- Seven hundred decorative stars compete for the same small-dot vocabulary.
  The philosopher layer is not immediately distinguishable as interactive data.

### Historical structure

- Era guide lines use 0.012-unit geometry at 0.22 opacity and sit behind the
  nodes. In the baseline screenshots they are nearly imperceptible.
- The historical spine is only 0.012 units thick at 0.4 opacity and appears as
  disconnected dark marks rather than an axis.
- BCE/CE direction is not labeled directly in the scene.
- Era labels are rendered at 9px and scaled by distance factors of 24. At the
  overview distances they become extremely small and low contrast.

### School clusters and labels

- Only three actual metadata groups meet the four-member threshold besides the
  unclassified group: Continental Philosophy (6), Analytic Philosophy (5), and
  Pre-Socratic (4).
- Labels use 9px text at low opacity with a distance factor of 20. They are
  barely readable in desktop/tablet captures and absent as meaningful anchors
  on mobile.
- There is no cluster silhouette, halo, or local guide, so school grouping is
  not visually legible without already knowing the layout algorithm.

### Overlay and loading

- The large top-left introduction and separate legend occupy substantial scene
  area while a left-to-right atmosphere gradient darkens the same region.
- The loading fallback is a single small status pill over a dark canvas. It
  explains neither the real loading stage nor how many philosophers are being
  positioned.
- Controls remain reachable, but their visual weight exceeds that of the
  galaxy, making the interface chrome the dominant first impression.

### Responsive behavior

- Mobile CSS rearranges the overlay but the Three.js response is primarily to
  move the camera much farther away. It does not adjust semantic node scale,
  halo scale, decorative density, or school-label count.
- The mobile canvas fills the viewport and has no horizontal overflow, but its
  large stacked header, legend, and control blocks leave a narrow visual window
  for an already fog-hidden galaxy.
- Hover is the only direct scene label trigger. Mobile visitors can use the
  accessible explorer, but scene nodes are too faint to communicate that they
  are tappable.

## Root cause

The empty appearance is not missing data: 114 records are present. It results
from a mismatch between real data bounds and guessed camera distances,
compounded by very small standard-material nodes, aggressive distance fog,
first-load opacity reduction, weak structural guides, low-contrast labels, and
the same dot-like visual language for decorative and semantic objects.
