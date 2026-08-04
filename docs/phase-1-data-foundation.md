# Phase 1 Philosophers API data foundation

Investigation and implementation date: 2026-08-04.

## Live API verification

The official origin is `https://philosophersapi.com`, with REST resources under
`https://philosophersapi.com/api`. Anonymous GET requests returned HTTP 200; no
API key or authorization header was required. Collection responses included
`Access-Control-Allow-Origin: *`. An OPTIONS request returned HTTP 200 with
GET, POST, PUT, OPTIONS, and DELETE in `Access-Control-Allow-Methods`, so the
Phase 1 browser client uses direct REST requests and has no proxy.

The following official endpoints were inspected with live requests:

- `GET /api/philosophers` and `GET /api/philosophers/:id`
- `GET /api/philosophers/search?keyword=du`
- `GET /api/categories` and `GET /api/categories/:id`
- `GET /api/keyideas` and `GET /api/keyideas/:id`
- `GET /api/quotes` and `GET /api/quotes/:id`
- `POST /graphql` with a minimal introspection query
- `/playground`, the official GraphQL playground
- Invalid resource and identifier requests for error behavior

At inspection time, the collections contained 114 philosophers, 17 categories,
699 key ideas, and 694 quotes. REST is used in Phase 1 because the required
collection and detail resources map directly to documented REST endpoints.
GraphQL is available at `/graphql`, but using both transports would add no value
to this phase.

The collection endpoints return unwrapped JSON arrays. Search uses a `keyword`
query parameter. Adding `page=1&limit=1` to the philosophers collection still
returned all 114 records, so pagination is neither inferred nor sent by the
client. Missing resources return HTTP 404 with a JSON body shaped like
`{"error":true,"reason":"Not Found"}`.

## Observed response differences

- All philosopher summaries had birth years, images, interests, and core IDs.
  Optional fields were genuinely absent: `school` appeared on 108/114 records,
  `birthDate` on 93/114, `deathDate` on 88/114, `speLink` on 88/114,
  `iepLink` on 75/114, and `topicalDescription` on 13/114.
- One living philosopher omitted `deathYear`; eight returned it as an empty
  string. These values normalize to an unknown year instead of an invented
  death or `Present` value.
- Philosopher years use strings such as `611 BC`, `1723 AD`, and zero-padded
  `0004 BC`.
- Quote `year` was null on 3/694 collection records and blank on 60/694. Quote
  `work` was blank on 14/694.
- Collection key ideas and quotes embed a philosopher reference containing only
  `id`. Detail responses expand that philosopher. The Phase 1 normalized models
  retain the stable owner ID and do not duplicate expanded philosopher data.
- Philosopher details add `birthLocation`, `works`, `quotes`, `keyIdeas`, and
  `arObjects`. The observed location coordinates were JSON numbers. The
  normalizer also accepts finite numeric strings defensively, then enforces
  latitude and longitude bounds.
- Key-idea details add explicit `agreeingKeyIdeas` and
  `disagreeingKeyIdeas`; category details add `associatedPhilosophers`; quote
  details add `relatedQuotes`.
- Image references are relative paths such as `/Images/Aesthetics.png`.

## Boundary and normalized models

Raw Zod schemas describe the observed transport shapes for philosopher
summaries and details, key-idea summaries and details, categories, quotes,
works, image dictionaries, entity references, and locations. Optionality is
limited to fields that were documented or absent in live responses. The API
client validates raw JSON before normalization; each normalizer then validates
its application model again.

Normalized philosopher models provide structured birth and death years,
trimmed interest arrays, nullable optional text and links, absolute image
references, and detail-only coordinates and related entity IDs. Key ideas keep
their owner philosopher ID, category abbreviations, and explicit agreement and
disagreement IDs. They contain no inferred lifespan, allowing future phases to
model an idea's continuation independently of its philosopher's lifespan.

Historical years use this convention:

```ts
type HistoricalYear = {
  original: string | null
  numeric: number | null
  era: 'BCE' | 'CE' | 'present' | 'unknown'
}
```

BCE years are negative, CE/AD years are positive, and year zero is rejected.
Missing, blank, malformed, `Unknown`, and `Present` inputs preserve what is
semantically available without inventing a numeric year.

The asset resolver preserves absolute HTTPS URLs, joins relative paths to the
official origin, and returns `null` for protocol-relative paths, backslash
paths, invalid URLs, and non-HTTPS protocols.

## Client, errors, and queries

The small fetch client centralizes the base URL, supports caller cancellation
and a 10-second default timeout, parses JSON explicitly, validates responses,
and never converts a failed request into an empty collection. Typed error codes
are `network`, `timeout`, `http`, `invalid-json`, and `invalid-response`.

TanStack Query keys are stable and rooted at `['philosophers-api']`:

- `['philosophers-api', 'philosophers']`
- `['philosophers-api', 'philosophers', 'detail', id]`
- `['philosophers-api', 'categories']`
- `['philosophers-api', 'key-ideas', 'detail', id]`

Only transient network and timeout errors retry, at most once after the first
attempt. Collections are stale after 30 minutes and details after 60 minutes.
The diagnostics panel intentionally loads the philosopher and category
collections at the root; detail requests remain disabled until a non-empty ID
is supplied.

## Deliberate limits

No influence graph, related thinker relationship, idea duration, missing date,
category association, agreement, or disagreement is inferred. AR objects are
retained only as IDs on philosopher details. No API assets are downloaded.
Phase 1 does not position philosophers, render data in the Three.js scene, or
add a proxy, backend, authentication, timeline, search interface, or detail
navigation.

Run `pnpm api:smoke` for an opt-in live philosopher collection validation. Unit
tests use small sanitized fixtures captured from observed API response shapes
and do not depend on network access.
