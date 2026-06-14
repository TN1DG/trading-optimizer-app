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

  // Market Structure panel
  marketCondition: string     // 'ranging' | 'trending' | ''
  marketBias: string          // 'bull' | 'bear' | ''

  // Research (News) panel
  newsTime: string            // 24h string e.g. '14:30', or '--:--'
  newsActive: boolean         // News button toggle (flickers red/white when on)
  lowImp: boolean             // Low Impact news toggle (glows red when on)
  highImp: boolean            // High Impact news toggle (glows red when on)

  // Aims (Side) panel
  currency: 'USD' | 'GBP'    // controls symbol shown on Profit Target and Max Loss
  profitTarget: string        // left profit target input
  profitTargetB: string       // right profit target input
  maxLossGBP: string          // left max loss input (always £ position)
  maxLossUSD: string          // right max loss input (always $ position)
  tradeQuotaA: string
  tradeQuotaB: string

  // Checklists
  sessionChecklist: ChecklistItem[]   // resets to DEFAULT on every page load (template)
  tradeChecklist:   ChecklistItem[]   // persisted across reloads
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

### Session Checklist — Template Behaviour
`sessionChecklist` is **never restored from localStorage** — `loadState()` always deep-clones `DEFAULT.sessionChecklist` on load. This makes it a per-session template. Currently defaults to one item: `MARK POIs` with six chip options (Daily H+L, Session H+L, Support + Resistance, Order Blocks, Draws of Liquidity, Breaker Blocks).

---

## Component Map

```
App.jsx                      — history reducer, localStorage, keyboard shortcuts, bottom bar
├── Header.jsx               — title + editable subtitle (double-click)
├── ChecklistColumn.jsx      — left column
│   ├── SidePanel.jsx        — "Aims" panel: currency toggle, Profit Target (×2), Max Loss, Trade Quota
│   ├── MS Panel (inline)    — "Market Structure" panel: Ranging/Trending + Bull/Bear buttons
│   ├── NewsPanel.jsx        — "Research" panel: News toggle, 12h clock, Low/High Imp buttons
│   ├── ChecklistItem.jsx    — individual item (toggle, rename, drag, chips, options editor)
│   │   └── OptionsEditor.jsx
│   └── (Session + Trade sections, each with own add-row)
├── RulesColumn.jsx          — right column
│   └── RuleItem.jsx         — individual rule (toggle, rename, drag)
└── Timer.jsx                — fixed bottom bar: "Trade Cool Down" mm:ss input, Start/Pause/Resume/Reset
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
- Split single checklist into **Session Checklist** and **Trade Checklist**
- Each section has its own add-row input
- Migration: old `checklist[]` from localStorage auto-splits on first load
- Session checklist resets to DEFAULT template on every load (not persisted)
- Default template: one item "MARK POIs" with 6 chip options

### Drag and Drop
- Within-section reordering via HTML5 drag (module-level `dragSrc = { id, col }`)
- Cross-section dragging supported: drop on an item inserts at that position (`REORDER_ITEMS`)
- Drop on empty section or section background appends to end (`MOVE_ITEM_TO_COL`)
- Section containers show dashed orange glow + "Drop items here" placeholder when empty

### Market Structure Panel (MS Panel)
- Ranging / Trending (condition) and Bull / Bearish (bias) buttons
- Titled "Market Structure", wrapped in `.ms-panel` container
- Compact pill style

### Research Panel (News Panel)
- Titled "Research"
- **News** button — toggles on/off, flickers red/white when active
- **Clock** — double-click to open native time picker, displays in 12h format, persists
- **Low Imp** — grey when inactive, red glow when toggled on
- **High Imp** — grey when inactive, red glow when toggled on (same as Low Imp)

### Aims Panel (Side Panel)
- Titled "Aims"
- **Currency toggle** ($ / £) — controls symbol shown on Profit Target and Max Loss
- **Profit Target** — two number inputs with bold `/` separator, currency symbol on each
- **Max Loss** — two number inputs with bold `/` separator, fixed positions (no swap on toggle)
- **Trade Quota** — two plain number inputs with `/` separator, no currency symbols

### Header Subtitle
- "Rules + Checklist" subtitle is double-click editable
- Always stored and displayed as uppercase
- Styled with yellow glow

### Undo / Redo
- 50-step history
- ↩ / ↪ buttons next to "Reset all checks"
- `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` keyboard shortcuts

### Trade Cool Down Timer
- Fixed bottom bar, labelled "Trade Cool Down"
- mm:ss inputs, Start / Pause / Resume / Reset
- Display and buttons grouped together (`.timer-main`)
- Flickers orange when countdown reaches zero

### Responsive Layout
- **≤ 380px**: tightest layout, timer bar two-row compact
- **≤ 640px**: single-column, session-top stacks, timer two rows (label+inputs / display+buttons)
- **641–900px**: two columns, single-row timer bar
- **901–1200px**: session-top wraps if needed
- **Touch devices**: opts-btn (☰) always visible

---

## Key CSS Classes

| Class | Purpose |
|---|---|
| `.col` | Column container (checklist or rules) |
| `.checklist-body` | Scrollable area inside checklist col |
| `.checklist-section` | Session or Trade sub-section |
| `.section-title` | Sub-section header |
| `.session-top` | Flex row: Aims + MS Panel + Research |
| `.ms-panel` | Market Structure buttons container |
| `.ms-panel-title` / `.side-panel-title` | Panel header label |
| `.side-panel` | Aims panel |
| `.news-panel` | Research panel |
| `.news-time-box` | Clock pill container |
| `.timer-main` | Groups timer display + buttons |
| `.section-list` | Droppable list container |
| `.section-list.drag-over` | Orange dashed border on drag-over |
| `.drop-placeholder` | "Drop items here" shown when section empty |
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
| v2 | Split into `sessionChecklist[]` + `tradeChecklist[]` |
| v3 | Added `subtitle`, `newsTime`, `lowImp`, `highImp` |
| v4 | Added `currency`, `profitTarget`, `maxLossGBP`, `maxLossUSD`, `tradeQuotaA`, `tradeQuotaB` |
| v5 | Added `newsActive`, `profitTargetB`; `sessionChecklist` no longer restored from storage |

`loadState()` in `App.jsx` handles all migrations with safe defaults.

---

## Deployment

- **Platform:** Vercel
- **Build:** `npm run build` (Vite)
- **Dev:** `npm run dev` → `http://localhost:5173`
- **No env vars required**
