# Phase 2 historical galaxy

Implementation date: 2026-08-04.

## Historical coordinate system

Birth year is the only historical input to a philosopher node's horizontal
position. BCE years are already negative and CE years positive in the Phase 1
normalized model. The pure mapping is:

```text
compressed = 5.6 × asinh((year - 1000) / 450)
x = 14 × tanh(compressed / 14)
```

The inverse-hyperbolic transform is strictly increasing, so chronological order
is preserved. It compresses dense values far from the 1000 CE center. The
outer hyperbolic tangent keeps even pathological outliers within a finite scene
range without introducing a hard clamp or reversing order. A missing or
non-finite year maps to `x = 15.5`, a separately labeled uncertainty region
rather than a fabricated date.

## Broad era boundaries

These labels are centralized orientation aids, not claims of universal academic
consensus:

| Era | Boundary |
| --- | --- |
| Ancient | before 500 CE |
| Medieval | 500–1499 CE |
| Early modern | 1500–1799 CE |
| Modern | 1800–1944 CE |
| Contemporary | 1945 CE onward |
| Unknown date | unavailable birth year |

Each era has a restrained visual token, a text label, and an HTML legend entry.
Color is never the only identification method.

## School clusters and deterministic offsets

School strings are trimmed, whitespace-normalized, Unicode-normalized, folded
to lowercase, and converted to stable keys. Missing schools use the explicit
`unclassified` key. FNV-1a hashing maps each school key to stable y/z cluster
centers. A second salted hash of philosopher ID and school key adds bounded
local y/z offsets, so peers remain in one loose region without occupying the
same point. No `Math.random()` participates in layout.

Horizontal position remains exact for the mapped birth year; local offsets do
not jitter time. Cluster proximity represents shared school metadata only. It
does not imply influence, agreement, lineage, causation, or importance.

## Lifespans

Nodes persist in the galaxy and never disappear at death. Birth year positions
the node; death year remains selected-record metadata. Formatting supports BCE,
CE, `Present`, and honest `Unknown` values. The API currently has missing death
years, including at least one historically stale record, so absence is not
silently interpreted as proof that a philosopher is living. No idea lifespan or
later influence is calculated.

## Scene architecture and interaction

The normalized collection is transformed into memoized `GalaxyPhilosopherNode`
records outside the Canvas. One Three.js `InstancedMesh` renders every
philosopher with a shared sphere geometry and material. Instance matrices and
colors update only when hover or selection changes; there are no React state
updates inside a render loop. Base size is equal for all philosophers because
the API supplies no defensible importance metric.

Hover updates one small name label and a subtle instance scale. Selection adds
one procedural ring and light, updates `?philosopher=<id>`, opens a concise DOM
summary, and moves the camera to a stable focus. Only the five most populated
school clusters may receive scene labels, and only while labels are enabled.
Era boundary lines and labels are optional. No constellation edges or inferred
relationships are drawn.

Drei CameraControls provides bounded orbit and zoom. Overview distance is 32
for landscape, 44 for intermediate aspect ratios, and 72 for portrait mobile
screens so the time axis fits more safely. Selection focuses from 5.6 scene
units. Reduced motion disables animated transitions, stops star movement, and
keeps hover feedback non-repeating. Camera coordinates are never stored in the
URL.

## Data and state ownership

The root uses the existing TanStack Query philosopher collection options once;
the Canvas receives normalized data and performs no fetch. Selecting a valid
summary enables the existing philosopher-detail query for that ID only.
Birthplace and key-idea counts therefore load on demand. Only one selected
portrait is rendered in the DOM, preferring 250px face or illustration assets;
the scene loads no portraits as textures.

The URL search parameter is the source of truth for shareable selection. Valid
IDs restore selection and camera focus, invalid IDs show a safe clear action,
clearing selection updates the URL, and router history supplies back/forward
behavior. Zustand owns only transient experience state: hover ID, guide and
label toggles, the intro/explore presentation mode, and camera-reset requests.
TanStack Query data is not copied into Zustand.

The philosopher collection now validates records individually. An isolated
malformed record is excluded while valid records remain usable; a non-empty
response with no valid records still becomes a typed invalid-response failure.
Loading, collection failure, empty data, selected-detail failure, broken image,
invalid URL ID, unsupported WebGL, and Canvas render failure all have visible
fallback behavior.

## Accessibility

The Canvas is not the only explorer. A modal Base UI dialog provides a semantic
list grouped by era, keyboard-selectable buttons, names, lifespans, and schools.
Selection is synchronized with the URL, camera, and visible summary. Focus is
trapped while the modal is open and restored on close. The control remains
outside the Canvas, so it also works when WebGL capability checks or the scene
error boundary fall back. Text explains both the historical direction and the
limited meaning of school clustering.

## Performance

Before Phase 2, the production build emitted one 1,316.59 kB main script
(368.48 kB gzip). Phase 2 dynamically imports the entire Three.js Canvas. The
current production build emits a 498.82 kB entry script (154.07 kB gzip) and a
942.68 kB on-demand galaxy chunk (249.96 kB gzip). CSS is 46.18 kB (8.44 kB
gzip). Development diagnostics are conditionally imported only in development
and do not appear in the production chunk list.

Vite's >500 kB advisory remains for the lazy Three.js scene chunk. It no longer
applies to the initial entry chunk. No speculative manual-chunk configuration
or new dependency was added.

## Deliberately not represented

Phase 2 does not render idea relationships, agreement, disagreement, influence,
quotes, key-idea orbits, geographic maps, scroll narrative, branching paths,
postprocessing, complex shaders, imported models, audio, or persistence. Phase
1 coordinates are retained for selected metadata but do not drive a map.
