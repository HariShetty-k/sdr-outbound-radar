# DESIGN.md — Outreach Radar

Custom design system, approved via the original mockup (`design-reference/*.dc.html` in the source kit). This is not a cloned brand style — it's this product's own visual language. Follow it for all UI work.

## 1. Visual theme & atmosphere

Warm, editorial, calm — a paper-and-terracotta workspace rather than a cold SaaS dashboard. Dense enough for a daily-use queue tool, but never cramped: generous row padding, soft card surfaces, a dark sidebar as an anchor. Mood: focused, slightly artisanal (fits an F&B vertical), trustworthy over flashy.

## 2. Color palette & roles

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f7f3ee` | App background (warm cream) |
| `--surface` | `#ffffff` | Cards, panels, modals |
| `--ink` | `#241c14` | Primary text |
| `--ink-soft` | `#6b6055` | Secondary text, labels |
| `--line` | `#e7ded3` | Borders, dividers |
| `--sidebar` | `#211a14` | Sidebar background |
| `--sidebar-soft` | `#a89a89` | Sidebar secondary text |
| `--sidebar-line` | `#3a2f24` | Sidebar dividers |
| `--accent` | `oklch(62% 0.14 45)` | Primary brand accent (terracotta) |
| `--accent-hover` | `oklch(55% 0.14 45)` | Accent hover/active state |
| `--accent-tint` | `oklch(94% 0.03 45)` | Accent-tinted backgrounds (badges, active chips) |
| `--good` | `oklch(58% 0.11 148)` | Success / primary CTA (Mark as processed) |
| `--good-tint` | `oklch(94% 0.04 148)` | Success-tinted backgrounds |
| `--warn` | `oklch(70% 0.13 75)` | Pending/awaiting states |
| `--warn-tint` | `oklch(94% 0.05 75)` | Pending-tinted backgrounds |
| `--mute` | `oklch(60% 0.01 80)` | Closed/inactive states |
| `--mute-tint` | `oklch(93% 0.005 80)` | Muted-tinted backgrounds |
| `--whatsapp` | `#3aa66a` | WhatsApp action icon |

## 3. Typography

- **Headings**: Sora, 600–800 weight. Page titles 26px/700, dialog titles 20px/700, stat values 18px/700.
- **Body**: IBM Plex Sans, 400–600 weight. Body text 13–14px, labels/meta 11–12.5px uppercase with `letter-spacing: 0.04–0.06em`.
- Both loaded via `next/font/google` in `app/layout.tsx` as `--font-sora` / `--font-plex`.

## 4. Component stylings

- **Buttons**: 9px radius, 10–11px vertical padding, 13–13.5px semibold text. Primary (`--good` fill, white text) for the one state-mutating action per screen; ghost (transparent, `--line` border) for secondary/dismissive actions.
- **Cards/rows**: 1px `--line` border, white surface, 9–14px radius depending on size (badges are full pill / 999px).
- **Badges/pills**: full pill radius, tinted background + matching-hue text, 11–11.5px bold, small leading dot icon.
- **Inputs**: 1px `--line` border, 9–10px radius, `--ink-soft` placeholder text.
- **Icon buttons** (WhatsApp/LinkedIn): 8px radius, tinted background matching the platform (green tint / blue tint), no border.

## 5. Layout principles

- Persistent shell: 260px dark sidebar + flexible light content area.
- Content padding: 36px vertical, 44px horizontal on main panels.
- Table-style lists use CSS grid rows with consistent column templates between the header and each row.
- Modals: centered, max-width 900px, two-column body split by a hairline border.
- New: drawers slide in from the right edge, full-height, ~360px wide, for auxiliary/secondary tasks (filters) that don't need the whole viewport's attention the way the brand-detail modal does.

## 6. Depth & elevation

- Cards/lists: flat, bordered — no shadow.
- Modal: `0 30px 60px -20px rgba(20,12,4,0.45)` over a `rgba(28,20,12,0.55)` scrim.
- Drawer: `-20px 0 40px -20px rgba(20,12,4,0.35)` (shadow cast toward the content, since it enters from the right).

## 7. Do's and don'ts

- **Do** keep exactly one primary (filled, `--good`) action per screen/dialog — this app's whole architecture rests on "Mark as processed" being the sole state-mutating action.
- **Do** use tinted pill badges for status/outcome, never raw color text.
- **Don't** introduce a second accent hue — terracotta (`--accent`) and green (`--good`) cover CTA + success; amber (`--warn`) and neutral (`--mute`) cover the rest.
- **Don't** add drop shadows to flat list/card surfaces — depth is reserved for modal and drawer overlays only.
- **Don't** let animation exceed the durations in the Motion section below — this is a calm, editorial product, not a playful one.

## 8. Responsive behavior

Day-1 scope is desktop-first (1440×900 reference from the mockup). If extended to mobile: collapse the 260px sidebar into a top bar or hamburger drawer, stack the two-column modal body vertically, and keep touch targets at least 40px tall.

## 9. Motion

Calm and subtle, matching the editorial feel — not playful, not bouncy.

- Durations: 150–200ms for hover/tap, 200–300ms for enter/exit, up to 400ms for the modal/drawer's largest move.
- Ease-out curves for things appearing; no springs except subtle button press feedback.
- Animate `opacity` + `transform` only (`x`/`y`/`scale`), never `width`/`height`/`top`/`left`.
- Distances: 8–16px slides, 0.97–1.03 scales.
- Respect `prefers-reduced-motion` via Motion's `MotionConfig reducedMotion="user"`, applied once in `app/layout.tsx`.

### Agent prompt guide

Quick reference when generating new UI: background `#f7f3ee`, surface white, ink `#241c14`, accent `oklch(62% 0.14 45)` (terracotta), success `oklch(58% 0.11 148)` (green). Headings in Sora bold, body in IBM Plex Sans. One primary green button per view. Flat bordered cards, pill badges, centered modal for primary flows, right-side drawer for secondary/filter flows.
