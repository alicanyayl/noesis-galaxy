# Phase 2 galaxy redesign

Implementation date: 2026-08-04.

## Why the previous composition failed

The pre-redesign Chromium capture is retained as
[`noesis-redesign-before.png`](screenshots/noesis-redesign-before.png). Its
philosopher data and interaction mechanics were correct, but its scene read as
a flat chart rather than an authored universe:

- A straight horizontal spine carried nearly all historical meaning.
- Ancient and modern records collapsed into two bright piles while the center
  remained empty.
- Era guides were vertical chart lines and the newest labels collided.
- Decorative particles were too subtle to create galactic volume.
- Philosophers were anonymous procedural points until selection.
- No visual object represented key ideas, agreement, or contradiction.
- School ellipses floated over the chart instead of attaching to a historical
  stream.

The redesign therefore replaces the scene grammar rather than adjusting the old
camera, scale, or contrast.

## Galaxy composition

The default scene has four coordinated layers:

1. A deep navy background with sparse deterministic stars and dust.
2. A luminous primary historical spiral, two lower-contrast echo arms, a dense
   central core, era-colored segments, and 1,100 arm-dust particles on desktop.
3. Soft school regions for the most populated real metadata groups.
4. Bright instanced philosopher cores and halos that dominate decorative
   particles.

The main path is sampled once into immutable points. Echo arms are authored
rotations of that curve; they provide a galactic silhouette but carry no
semantic relationship claim.

## Historical curve

`historicalPathProgress(year)` maps known birth years to an ordered scalar. Arc
length is allocated by broad era:

| Era segment | Progress interval |
| --- | --- |
| Ancient | 0.00–0.23 |
| Medieval | 0.23–0.39 |
| Early modern | 0.39–0.58 |
| Modern | 0.58–0.82 |
| Contemporary | 0.82–1.00 |

The scalar drives a 2.18π-radian elliptical spiral—slightly more than one full
turn—whose radius expands from 1.15 to 9.9 scene units. Known dates preserve order along the path. A missing date
uses progress 1.08 and the explicitly separate uncertainty location. Layout is
pure, memoized, and contains no unseeded randomness.

## School clustering

Each philosopher begins at their birth-year point. A deterministic school hash
selects a narrow band normal to the curve; a second philosopher-ID hash supplies
small local lateral and depth offsets. This prevents stacking without allowing
school metadata to reverse chronology.

Only schools present in the API appear. Labels and soft boundaries are limited
by viewport quality. Their contract is visible in the interface:

> Constellation proximity marks shared school metadata, not direct influence.

## Philosopher hierarchy and images

All philosophers have equal base importance because the API does not provide a
defensible importance value. Every record uses the same two instanced meshes:
one warm-ivory core and one cool additive halo. Hover and focus change emphasis;
fame does not.

The overview requests no images. Hover resolves a small thumbnail. Selection
resolves one modest face/illustration URL for a circular scene medallion and the
HTML panel, normally sharing the browser cache. Images are lazy in the scene,
retain aspect ratio, and fall back to initials. Full-body and 750px assets are
not requested by the resolver.

## Key-idea systems

Selecting a philosopher enables their existing detail query and the normalized
key-idea collection query. The initial local system renders at most six direct
ideas in deterministic elliptical orbits; the panel can expand to all ideas.
Each philosopher-to-idea line is a direct API ownership relationship.

Selecting an idea adds `idea=<id>` to the URL and fetches only that idea's
detail endpoint. The response supplies explicit `agreeingKeyIdeas` and
`disagreeingKeyIdeas`. The scene initially caps each relationship kind at four
projections to control clutter, while the panel reports the full API totals.

Agreement uses a continuous Catmull-Rom connection, round node, continuous
border, cyan label, and a flowing marker. Disagreement uses an angular broken
path, dashed material, octahedral node, interrupted border, and amber label.
Reduced motion parks the agreement marker while retaining all information.

Related idea projections include a faint thread to their actual owning
philosopher position when that philosopher exists in the collection. These can
cross multiple eras and remain visible regardless of the source philosopher's
death year. Clicking a projection navigates to its real owner and idea.

No relation is inferred from category, school, date, text similarity, or
proximity.

## Verified live demonstration

The live API audit found 699 key ideas and 452 key ideas with at least one
explicit agreement or disagreement relation. The screenshots use René
Descartes (`3C6BCB23-5C68-4F54-B680-BFF333FB6683`):

- official API face image,
- lifespan 1596–1650,
- Cartesianism school metadata,
- 9 direct key ideas,
- dualism idea `3B8B4D53-2886-45A4-877C-AE452A6A6F2A`,
- 2 explicit agreements,
- 8 explicit disagreements.

The idea-network capture renders both agreements and four of the eight
disagreements. The related owners include Ancient, Medieval, Early modern, and
Modern thinkers, so the faint ownership threads demonstrate cross-era
continuation without inventing an idea lifespan.

## Camera states

- **Galaxy:** calculated bounds framing with bounded manual orbit and zoom.
- **Philosopher:** 5.2-unit desktop focus on the local idea system.
- **Idea:** 6.7-unit desktop focus to include relationship projections.
- **Reset:** clears philosopher and idea URL state and restores calculated
  overview framing.

Camera transitions use Drei CameraControls. Reduced motion uses near-immediate
transitions. There is no constant camera drift or scroll-driven movement.

## Responsive UI

Desktop retains a compact upper-left orientation layer and a lower-right detail
panel. Mobile hides redundant intro/era cards during focus, keeps the selected
system visible above, and turns details into a fixed, scrollable bottom sheet.
The close control and idea buttons stay reachable without horizontal overflow.
Particle counts, school-label counts, node scale, and camera distance are
centralized by viewport class.

## Accessibility

The Base UI accessible explorer remains outside Canvas and works through WebGL
fallbacks. It groups philosophers by era and exposes names, lifespans, and
schools as keyboard-selectable buttons. The DOM panel exposes idea text,
categories, relationship counts, explicit connection descriptions, back
actions, and source links. Color is never the only connection encoding.

## Performance

The live 1440×1000 Chromium measurement reported:

| State | Draw calls | Semantic nodes | Image requests |
| --- | ---: | ---: | ---: |
| Overview | 31 | 114 philosophers | 0 |
| Philosopher | 44 | 114 philosophers + 6 ideas | 1 active portrait resource |
| Idea network | 67 | 114 philosophers + 7 local ideas + 6 relation projections | cached portrait |
| Mobile philosopher | 30 | 114 philosophers + 6 ideas | 1 active portrait resource |

Two image requests were observed across two deliberate full desktop
navigations; the overview made none. The semantic cores and halos remain two
instanced meshes. Curves, dust, and layout are memoized and no React state is
updated per frame.

Production build:

- initial script: 499.80 kB / 154.98 kB gzip,
- lazy galaxy: 974.21 kB / 258.80 kB gzip,
- lazy philosopher summary: 7.88 kB / 2.66 kB gzip,
- CSS: 53.79 kB / 10.53 kB gzip.

The remaining Vite advisory applies to the lazy Three.js chunk, not the initial
script.

## Screenshots

- [`noesis-redesign-overview.png`](screenshots/noesis-redesign-overview.png):
  spiral, echo arms, historical segments, schools, dust, and 114 philosophers.
- [`noesis-redesign-philosopher.png`](screenshots/noesis-redesign-philosopher.png):
  Descartes portrait medallion, focused camera, six direct key ideas, and panel.
- [`noesis-redesign-idea-network.png`](screenshots/noesis-redesign-idea-network.png):
  selected dualism text, agreement curves, interrupted disagreements, and
  cross-era owner threads.
- [`noesis-redesign-mobile.png`](screenshots/noesis-redesign-mobile.png): focused
  scene above a usable key-idea bottom sheet at 390×844.

## Remaining limitations

- Category abbreviations are shown as returned; the focused view does not yet
  join category descriptions into the label.
- Relationship projections are deliberately capped; the later full Idea Clash
  mode can support filtering and comparing the complete relation set.
- The galaxy is an authored historical atlas, not evidence of intellectual
  influence or a scholarly genealogy.
- The next narrative phase may add scroll-driven chapters, but none are started
  here.
