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

All state lives in a single object managed by `useReducer` in `App.jsx` and persisted to `localStorage` under the key `fxboyz`. Shape:

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
  sessionChecklist: [{ id, text, checked, options[], selectedOptions[] }],
  tradeChecklist:   [{ id, text, checked, options[], selectedOptions[] }],
  rules:            [{ id, text, checked }],
}
```

`DEFAULT` in `AppContext.jsx` defines the initial data. IDs are generated as `max(existing ids) + 1`. Checklist IDs start from 1; rules IDs start from 101 to keep them distinct.

### State management pattern

All mutations go through `dispatch(action)` — the reducer in `AppContext.jsx` handles every action type. State is consumed via the `useApp()` hook (which reads from `AppContext`). After every dispatch, `App.jsx` persists the new state to `localStorage`.

### Checklist vs Rules asymmetry

Checklist items (`sessionChecklist`, `tradeChecklist`) have extra features rules do not:
- **`options[]` / `selectedOptions[]`** — per-item multi-select options the user can populate
- **Options editor** — rendered by `OptionsEditor.jsx`, toggled per item

When adding features, check whether they apply to both checklists and rules, or checklist only.

### Impact buttons

`lowImp` and `highImp` are mutually exclusive — toggling one sets the other to `false` (handled in the reducer via `TOGGLE_LOW_IMP` / `TOGGLE_HIGH_IMP`).
