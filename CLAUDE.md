# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

This is a React + Vite app. Start the dev server:

```powershell
npm run dev
```

Then open **http://localhost:5173** (or the next available port) in a browser.

Deployed on Vercel — `index.html` is the Vite entry point served at `/`.

## Architecture

React + Vite app. Source lives in `src/`:

```
src/
  main.jsx              # mounts <App />
  App.jsx               # root layout, AppContext provider, localStorage persistence
  index.css             # global styles
  context/
    AppContext.jsx       # DEFAULT state, reducer, AppContext, useApp hook
  components/
    Header.jsx
    MarketBar.jsx
    ChecklistColumn.jsx
    ChecklistItem.jsx
    OptionsEditor.jsx
    RulesColumn.jsx
    RuleItem.jsx
    SidePanel.jsx
    NewsPanel.jsx
    Timer.jsx
```

### State model

Each **page** owns one state object (the per-page "board"). The reducer in `AppContext.jsx` operates on a single page's state; its shape:

```js
{
  marketCondition: '',
  marketBias: '',
  subtitle: '',
  newsTime: '--:--',
  newsActive: false,
  lowImp: false,
  highImp: false,
  currency: 'USD',
  profitTarget: '',
  profitTargetB: '',
  maxLossGBP: '',
  maxLossUSD: '',
  tradeQuotaA: '',
  tradeQuotaB: '',
  panelOrder: ['currentTrade','marketStructure','news','aims','calculator'], // session-top panel order (drag to reorder)
  presets: [{ id, name, snapshot }],   // per-page saved views; snapshot = full page state minus `presets`
  sessionChecklist: [{ id, text, checked, options[], selectedOptions[] }],
  tradeChecklist:   [{ id, text, checked, options[], selectedOptions[] }],
  rules:            [{ id, text, checked }],
}
```

`DEFAULT` in `AppContext.jsx` defines the initial data. IDs are generated as `max(existing ids) + 1`. Checklist IDs start from 1; rules IDs start from 101 to keep them distinct.

### Pages / tabs layer

`App.jsx` wraps the per-page state in a root structure `{ pages: [{ id, name, history }], activeId }` managed by `rootReducer`. Each page's `history` is a `{ past, present, future }` undo/redo stack (the `historyReducer`); undo/redo are **per page**. Page-level actions (`ADD_PAGE`, `DELETE_PAGE`, `SWITCH_PAGE`, `RENAME_PAGE`) are handled in `rootReducer`; every other action is routed to the active page's history. The whole root (all pages, present state only) is persisted to `localStorage` under the key `fxboyz`; a legacy single-page save is migrated into one page on load. `TabBar.jsx` renders the tabs and the per-page `PresetMenu`.

### Reorderable panels + presets

The Session Checklist top row renders the panels named in `panelOrder` (`ChecklistColumn.jsx`); each is wrapped in a `.panel-block` with a `.panel-grip` drag handle that dispatches `REORDER_PANELS`. `PANEL_KEYS` in `AppContext.jsx` is the canonical list — `migrateState` (in `App.jsx`) drops unknown keys and appends newly-added panels. Presets (`SAVE_PRESET` / `LOAD_PRESET` / `DELETE_PRESET`) capture a full page snapshot (layout included); loading replaces page content but keeps the preset library.

### Sharing presets

There is no backend — presets are shared via a URL hash. `src/lib/presetShare.js` encodes `{ name, snapshot }` as base64url into `#preset=…` (`buildShareLink`); `PresetMenu.jsx`'s 🔗 button copies that link to the clipboard. On load, `SharedPresetBanner.jsx` reads the hash (`parseSharedPreset`, which normalizes the untrusted snapshot against `DEFAULT`/`PANEL_KEYS`) and offers a one-click import via `ADD_PRESET`, then clears the hash. Because the import is read once on mount, a recipient must open the link in a fresh load (the e2e tests reload after navigating to the hash URL).

### State management pattern

All mutations go through `dispatch(action)` — the reducer in `AppContext.jsx` handles every action type. State is consumed via the `useApp()` hook (which reads from `AppContext`). After every dispatch, `App.jsx` persists the new state to `localStorage`.

### Checklist vs Rules asymmetry

Checklist items (`sessionChecklist`, `tradeChecklist`) have extra features rules do not:
- **`options[]` / `selectedOptions[]`** — per-item multi-select options the user can populate
- **Options editor** — rendered by `OptionsEditor.jsx`, toggled per item

When adding features, check whether they apply to both checklists and rules, or checklist only.

### Impact buttons

`lowImp` and `highImp` are mutually exclusive — toggling one sets the other to `false` (handled in the reducer via `TOGGLE_LOW_IMP` / `TOGGLE_HIGH_IMP`).
