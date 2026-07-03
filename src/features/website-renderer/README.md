# Website Renderer feature

The **React realisation of the Website Blueprint** (ADR-022): hand-crafted
premium primitives composed 1:1 from Section Primitive Registry ids (ADR-021)
— the Renderer never free-generates layout. v1 crafts the emergency-archetype
path to the WOW bar, plus the scroll-driven transformation arc.

## Status

**v1 — emergency path.** Deterministic render of the homepage blueprint; no
media generation, no export, no multi-page. Other archetypes' primitives fail
loudly in development until their crafted components land.

## Route

- `/experience-studio/preview` — full-screen preview (own root layout, thin
  TITAN chrome bar). Business context via the URL (ADR-019 pattern) with
  graceful fallback to the sample business.

## Public API (`index.ts`)

- `WebsitePreviewPage` — the preview, rendered by the route.
- `renderPage(blueprint, options?)` — pure composition: header → sections →
  footer under the resolved theme. Deterministic. Unmapped primitives throw in
  development and skip (+warn) in production.
- `PRIMITIVE_COMPONENT_MAP` + types — the registry-id → component map.

## Copy & media rules

- Brand/marketing copy comes ONLY from blueprint content slots — zero
  hardcoded copy. Structural eyebrows use registry primitive names;
  interaction affordances (form labels, drag hints) are neutral interface
  furniture.
- No AI photos, no stock: atmosphere comes from composition, typography, and
  motion (plus one generated, checked-in gradient poster). Real-photography,
  review, and FAQ content render as art-directed, explicitly annotated slots.

## Structure

```
website-renderer/
├── index.ts                    # public API
├── model/                      # types, slot parsing, primitive map, renderPage
├── theme/                      # token sets (by blueprint themeRef) + fonts
├── motion/                     # shared Framer Motion system (reduced-motion aware)
├── primitives/                 # one crafted component per registry primitive
└── components/                 # WebsitePreviewPage + lazy RenderedSite boundary
```

## Architecture & performance

Consumes ONLY `core/website-blueprint` (+`core/experience-strategy` for the
preview's generation chain) — `feature → core`. Hero is a server component
animated in pure CSS; interactive primitives hydrate lazily. Lighthouse mobile
(production build): performance median 90, a11y 96, CLS 0 — see ADR-022 for
the full posture. Tests in `tests/features/website-renderer/`.
