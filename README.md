# Tria — rewards payout flow

A static, responsive implementation of the Tria "choose how you receive your rewards"
flow, built 1:1 from Figma. No build step, no dependencies — open `index.html`.

## Screens

| File | Screen |
|---|---|
| `index.html` | Selection — Points vs Cashback, with the photo gallery |
| `confirmation-points.html` | "You're Set to Earn Points" |
| `confirmation-cashback.html` | "You're Set to Earn Cashback" |
| `preference-points.html` | Returning user — preference is Points |
| `preference-cashback.html` | Returning user — preference is Cashback |

### Flow

```
index ──Choose Points────► confirmation-points ──Back to Tria──► preference-points
      └─Choose Cashback──► confirmation-cashback ─Back to Tria─► preference-cashback

confirmation-points  ──Switch to Cashback──► [modal] ──Confirm──► confirmation-cashback
confirmation-cashback ──Switch to Points───► [modal] ──Confirm──► confirmation-points
preference-points     ──Switch to Cashback─► [modal] ──Confirm──► preference-cashback
preference-cashback   ──Switch to Points───► [modal] ──Confirm──► preference-points
```

The confirm-change modal is a page state, not a separate file: a bottom sheet below
1000px, a centred dialog above it.

## Layout

Fixed pixel values per breakpoint — no `scale()`, no viewport-relative type.
Containers flex; their contents don't.

- **base → 767px** — mobile composition (drawn at 390)
- **768 → 999px** — same type, wider containers (`max-width` does the work, no media query)
- **1000px +** — desktop: 72px header, 60px headline, 20px subline, 80px footer notches

Rendered heights match the Figma frames within ~2px, the residual being Figma
rounding line boxes to whole pixels.

## Behaviour

- **Gallery** (selection page) — autoplays every 4s, loops, pauses on hover, advances
  on click. Neighbouring slides show as dimmed 8px slivers.
- **Option cards** — selecting one rewrites the headline, subline and CTA behind a
  short cross-fade, and animates the headline's height when the line count changes.
  A selected card is inert on hover; only its gallery stays live.
- **Modal** — closes on the scrim, Escape, "Keep …" or the desktop ✕. Focus is trapped
  and restored, page scroll is locked. The confirm button is a plain link, so the flow
  works with JavaScript disabled.
- `prefers-reduced-motion` is honoured throughout.

## Structure

```
assets/
  css/style.css     all styling, tokens at the top
  js/app.js         selection page — option switching + gallery
  js/flow.js        confirm-change modal, shared by the four flow pages
  fonts/            Geist, self-hosted as woff2
  img/              backgrounds (SVG), logo/wordmark (SVG), photos (WebP)
```

## Fonts

Set in **Geist**, self-hosted as woff2. Geist is published by Vercel under the
SIL Open Font License 1.1 — if you redistribute this repo, add the upstream
`OFL.txt` alongside the font files.

## Images

The photographs and Tria marks are exported from the source Figma file and are
included here for the prototype only. Check their licensing before using this
publicly.
