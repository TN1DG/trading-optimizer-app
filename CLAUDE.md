# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

Open `index.html` directly in a browser — no build step, no server, no dependencies. On Windows:

```powershell
Start-Process "index.html"
```

Deployed on Vercel — `index.html` is the entry point served at `/`.

## Architecture

Single self-contained HTML file with inline `<style>`, markup, and `<script>`. No framework, no bundler, no external dependencies (icons use Tabler Icons classes but are not critical to functionality).

### State model

All data lives in a single `state` object persisted to `localStorage` under the key `fxboyz`. Shape:

```js
{
  checklist: [{ id, text, checked, options[], selectedOption }],
  rules:     [{ id, text, checked }]
}
```

`DEFAULT` defines the initial data and is deep-cloned on first load. IDs are generated as `max(existing ids) + 1`. Checklist IDs start from 1; rules IDs start from 101 to keep them distinct.

### Render pattern

Every mutation calls `save()` then `render()`. `render()` wipes both list containers and rebuilds the DOM from scratch — there is no diffing or partial update. `openEditors` is an in-memory `Set` of item IDs (not persisted) that tracks which checklist items have their dropdown options editor expanded.

### Checklist vs Rules asymmetry

Checklist items have two extra features rules do not:
- **`options[]` / `selectedOption`** — a per-item dropdown the user can populate with choices
- **Options editor** — toggled by the ☰ button (`.opts-btn`), renders an inline `.opts-editor` panel below the item for adding, editing, and deleting dropdown options

When adding new fields or interactive controls, check whether the feature applies to both columns or checklist only, and follow the existing `col === 'checklist'` guard pattern.

### Event propagation

Item rows have a click listener for `toggleItem`. All buttons inside an item (`del-btn`, `opts-btn`, `item-select`) call `event.stopPropagation()` to prevent accidentally toggling the checked state. Maintain this pattern for any new controls added inside `.item`.

### escHtml

All user-supplied strings written into `innerHTML` must go through `escHtml()`. This applies to item text, option labels, and option values in select elements.
