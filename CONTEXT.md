# FX Boyz Tool — Project Context

> Living document. Update this file whenever a feature is added, changed, or removed.

---

## Project Overview

A trading pre-session checklist and rules tracker for FX traders. Built as a React + Vite SPA, deployed on Vercel. All state persists to `localStorage` under the key `fxboyz`.

**Entry point:** `index.html` → `src/main.jsx` → `src/App.jsx`

---

## Architecture

### State
All app data lives in a single state object managed by `useReducer` in `App.jsx`, wrapped in a 50-step undo/redo history reducer. Persisted to `localStorage` on every change.

```
{
  // UI meta
  subtitle: string            // editable header subtitle
  marketCondition: string     // 'ranging' | 'trending' | ''
  marketBias: string          // 'bull' | 'bear' | ''

  // News panel
  newsTime: string            // 24h string e.g. '14:30', or '--:--'
  lowImp: boolean             // Low Impact news toggle (glows red)
  highImp: boolean            // High Impact news toggle (glows green)

  // Side panel
  currency: 'USD' | 'GBP'    // controls symbol shown on Profit Target
  profitTarget: string
  maxLossGBP: string
  maxLossUSD: string
  tradeQuotaA: string
  tradeQuotaB: string

  // Checklists
  sessionChecklist: ChecklistItem[]   // ids 1–N
  tradeChecklist:   ChecklistItem[]   // ids continuing from sessionChecklist
  rules:            RuleItem[]        // ids start at 101

  // ChecklistItem shape
  // { id, text, checked, options: string[], selectedOptions: string[] }

  // RuleItem shape
  // { id, text, checked }
}
```

### ID uniqueness
Checklist IDs (session + trade combined) share a namespace — `nextId` always takes the max across both arrays. Rule IDs start at 101 to stay distinct.

### Undo / Redo
`historyReducer` in `App.jsx` wraps the main `reducer`. `UNDO`/`REDO` actions pop/push between `past[]`, `present`, and `future[]`. Capped at 50 steps. Keyboard: `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`.

---

## Component Map

```
App.jsx                      — history reducer, localStorage, keyboard shortcuts, bottom bar
├── Header.jsx               — title + editable subtitle (double-click)
├── ChecklistColumn.jsx      — left column
│   ├── MarketBar ×2         — Ranging/Trending + Bull/Bear buttons (in Session section)
│   ├── SidePanel.jsx        — currency toggle, Profit Target, Max Loss, Trade Quota
│   ├── NewsPanel.jsx        — News button, 12h clock, Low/High Imp buttons
│   ├── ChecklistItem.jsx    — individual item (toggle, rename, drag, chips, options editor)
│   │   └── OptionsEditor.jsx
│   └── (Session + Trade sections, each with own add-row)
├── RulesColumn.jsx          — right column
│   └── RuleItem.jsx         — individual rule (toggle, rename, drag)
└── Timer.jsx                — fixed bottom bar: mm:ss input, Start/Pause/Resume/Reset
```

---

## Feature Progression

### Foundation
- Single-column checklist + rules tracker
- Toggle checked state, add/delete/rename items
- Per-item dropdown options (chip multi-select)
- Options editor (☰ button) per checklist item
- Drag-to-reorder items in both columns
- `localStorage` persistence

### Font & Style
- Global font switched to Coolvetica Rg
- Rules column: bold red uppercase text, large font
- Pointer cursor on item titles

### React Migration
- Migrated from single `index.html` to React + Vite component architecture

### Checklist Sections (Session / Trade)
- Split single checklist into **Session Checklist** (items 1–4) and **Trade Checklist** (items 5–8)
- Each section has its own add-row input
- Migration: old `checklist[]` from localStorage auto-splits on first load

### Market Condition Buttons
- Ranging / Trending (condition) and Bull / Bearish (bias) buttons
- Moved inside Session Checklist section
- Compact pill style (not full-width)

### News Panel
- Sits beside the market buttons in a flex row within Session Checklist
- **News** label button
- **Clock** — double-click to open native time picker, displays in 12h format, persists
- **Low Imp** — toggles red glow until clicked off
- **High Imp** — toggles green glow until clicked off

### Side Panel
- Sits beside the News Panel
- **Currency toggle** ($ / £) — controls symbol shown on Profit Target
- **Profit Target** — single currency input (follows toggle)
- **Max Loss** — two number inputs side by side with bold `/` separator, fixed positions (no swap on toggle), symbol follows currency toggle
- **Trade Quota** — two plain number inputs with `/` separator, no currency symbols

### Header Subtitle
- "Rules + Checklist" subtitle is double-click editable
- Always stored and displayed as uppercase
- Styled with yellow glow matching the Trending button active state

### Undo / Redo
- 50-step history
- ↩ / ↪ buttons next to "Reset all checks"
- `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` keyboard shortcuts
- Buttons dim when no history available

### Responsive Layout
- **≤ 380px**: tightest layout, smallest fonts
- **≤ 640px**: single-column, session-top stacks vertically, market buttons wrap, rules text scales to 14px, touch-friendly
- **641–900px**: two columns kept, session-top wraps, rules text 15px
- **901–1200px**: session-top wraps if needed, rules text 17px
- **Touch devices**: opts-btn (☰) always visible (no hover required)

---

## Key CSS Classes

| Class | Purpose |
|---|---|
| `.col` | Column container (checklist or rules) |
| `.checklist-body` | Scrollable area inside checklist col |
| `.checklist-section` | Session or Trade sub-section |
| `.section-title` | Sub-section header (bold white uppercase) |
| `.session-top` | Flex row: market btns + side panel + news panel |
| `.session-market-btns` | Stacked Ranging/Trending + Bull/Bear bars |
| `.side-panel` | Currency/target/loss/quota panel |
| `.news-panel` | News clock + impact buttons |
| `.item` / `.item.checked` | Checklist or rule row |
| `.item-wrap.has-chips` | Item with chip options visible |
| `#timer-bar` | Fixed bottom timer strip |
| `.history-btns` | Undo/redo button pair |
| `.bottom-bar` | Reset + undo/redo row |

---

## localStorage Migration History

| Version | Change |
|---|---|
| v1 | `checklist[]` single array |
| v2 | Split into `sessionChecklist[]` + `tradeChecklist[]` (first 4 → session, rest → trade) |
| v3 | Added `subtitle`, `newsTime`, `lowImp`, `highImp` |
| v4 | Added `currency`, `profitTarget`, `maxLossGBP`, `maxLossUSD`, `tradeQuotaA`, `tradeQuotaB` |

`loadState()` in `App.jsx` handles all migrations with safe defaults.

---

## Deployment

- **Platform:** Vercel
- **Build:** `npm run build` (Vite)
- **Dev:** `npm run dev` → `http://localhost:5173`
- **No env vars required**
