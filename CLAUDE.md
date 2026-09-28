# SENSES — Claude Code Context

## Project

Premium media discovery platform with two divisions: **SIGHT** (visual) and **HEARING** (audio).

- **Live site:** https://senses.dhurta.org
- **Repo:** prashantkeshr/SENSES (GitHub Pages via Actions)
- **Stack:** Astro 4 SSG + React 18 islands + TypeScript + Tailwind CSS
- **Location:** `C:\Users\prash\OneDrive\Projects\Claude project\senses\`
- **Dev server:** `npm run dev` → http://localhost:4321

---

## Architecture rules

### Data provider — never bypass it
All data flows through `src/lib/providers/index.ts`. Never import JSON files directly. The provider is the abstraction layer for a future backend swap.

### Astro islands hydration
- `client:visible` — only in `.astro` files, NOT inside React `.tsx` files
- `client:load` — for above-the-fold interactive islands
- `client:idle` — for non-critical islands (PWA install prompt, etc.)

### localStorage keys
| Key | Contents |
|-----|----------|
| `senses:user-state` | Likes, saves, follows, history, interest signals |
| `senses:comments` | Per-media comment threads |
| `senses:user-collections` | User-created collections |
| `senses:downloads` | Download records |
| `senses:settings` | Theme, accent, density, preferences |
| `senses:pwa-install-dismissed` | PWA install banner dismissal |

### Cross-island communication
Use `window.dispatchEvent(new CustomEvent('senses:toast', { detail: { message, type } }))` for toast notifications. Never import React state across islands — use the event bus pattern.

### Theme system
- `data-theme="dark"` (default) / `data-theme="light"` on `<html>`
- CSS variables in `:root` define dark theme; `html[data-theme="light"]` overrides
- Tailwind background/surface/border/text tokens reference CSS variables
- Sight (`#C8B89A`), Hearing (`#8FAEC0`), Accent (neon red `#FF2D55`) are fixed hex (used with opacity modifiers)
- Dynamic accent override: `data-accent` attribute + CSS variable `--color-accent`

---

## Design tokens

### Tailwind custom colors
`senses-bg`, `senses-surface`, `senses-surface-2`, `senses-surface-3`, `senses-border`, `senses-border-2`, `senses-text`, `senses-text-2`, `senses-text-3` — these reference CSS variables and respond to light/dark theme.

`senses-accent` (`#FF2D55` neon red), `senses-sight` (`#C8B89A`), `senses-hearing` (`#8FAEC0`) — fixed hex values, safe to use with Tailwind opacity modifiers (`/10`, `/15`, `/40`, etc.)

### Typography
- Body: `Inter` (variable font)
- Brand logo: `Dancing Script` (Google Font, loaded via BaseLayout)
- Mono: `JetBrains Mono`

---

## Key components

| Component | Path | Notes |
|-----------|------|-------|
| Global nav | `src/components/layout/GlobalNav.tsx` | Animated Dancing Script logo, Reel pill button |
| Search overlay | `src/components/layout/SearchOverlay.tsx` | Ctrl+K shortcut |
| Media card | `src/components/media/MediaCard.tsx` | `layout="masonry"` (default) or `"grid"` |
| Audio player | `src/components/media/AudioPlayer.tsx` | 60-bar SVG waveform |
| Media actions | `src/components/media/MediaActions.tsx` | Like/Save/Collect/Share/Download |
| For You section | `src/components/personalization/ForYouSection.tsx` | Signal-weighted recommendations |
| Toast | `src/lib/utils/toast.ts` | Event bus — dispatch `senses:toast` |
| Settings | `src/components/settings/SettingsPage.tsx` | Theme + accent + density + preferences |
| Gallery wall | `src/components/gallery/GalleryWall.tsx` | Random shuffle full-bleed masonry |

---

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/pages/index.astro` | Home |
| `/explore` | `src/pages/explore.astro` | Filtered masonry grid |
| `/discover` | `src/pages/discover.astro` | Full-screen reel feed |
| `/gallery` | `src/pages/gallery.astro` | Random shuffle wall |
| `/sight`, `/hearing` | division index pages | |
| `/sight/[type]/[slug]` | sight detail | Has ColorPalette, CommentsSection |
| `/hearing/[type]/[slug]` | hearing detail | Has AudioPlayer, CommentsSection |
| `/search` | search page | Fuse.js client island |
| `/trending` | trending charts | TrendingCharts client island |
| `/editorial` | editor's picks | Static with spotlight hero |
| `/mood/[slug]` | mood landing | 38 moods, static paths |
| `/style/[slug]` | style landing | 37 styles, static paths |
| `/tag/[slug]` | tag landing | Static paths |
| `/my-senses` | personal hub | Tabs: liked/saved/following/collections/downloads |
| `/settings` | settings | SettingsPage client island |
| `/creator/[id]` | creator profile | |
| `/collections/[slug]` | collection detail | |
| `/404`, `/offline` | error pages | |

---

## Seed data

`src/data/media.json` — 30 items, 38 moods, 37 styles  
`src/data/creators.json` — 10 creators  
`src/data/categories.json` — categories  
`src/data/collections.json` — cross-sensory collections  

Images: `picsum.photos/seed/{slug}/{w}/{h}` — consistent per slug (V1 placeholder)

---

## Git attribution

Always commit as:
```
-c user.name="Prashant Keshri" -c user.email="prashantkeshr@gmail.com"
```
Trail: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

No `Co-Authored-By` for the user — only for Claude.
