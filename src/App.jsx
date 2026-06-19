import { useReducer, useEffect, useCallback } from 'react'
import { AppContext, reducer, DEFAULT } from './context/AppContext'
import Header from './components/Header'
import TabBar from './components/TabBar'
import ChecklistColumn from './components/ChecklistColumn'
import RulesColumn from './components/RulesColumn'
import Timer from './components/Timer'

const HISTORY_LIMIT = 50
const STORAGE_KEY = 'fxboyz'

function historyReducer(history, action) {
  if (action.type === 'UNDO') {
    if (history.past.length === 0) return history
    const previous = history.past[history.past.length - 1]
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    }
  }
  if (action.type === 'REDO') {
    if (history.future.length === 0) return history
    const next = history.future[0]
    return {
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    }
  }
  const next = reducer(history.present, action)
  if (next === history.present) return history
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
  }
}

function normalizeItem(item) {
  return {
    options: [],
    ...item,
    selectedOptions: Array.isArray(item.selectedOptions)
      ? item.selectedOptions
      : item.selectedOption
      ? [item.selectedOption]
      : [],
  }
}

// Apply field defaults + migrations to a single page's persisted state.
function migrateState(parsed) {
  if (!parsed.marketCondition) parsed.marketCondition = ''
  if (!parsed.marketBias) parsed.marketBias = ''
  if (!parsed.tradeDirection) parsed.tradeDirection = ''
  if (parsed.tradeBE === undefined) parsed.tradeBE = false
  if (parsed.tradeRisk === undefined) parsed.tradeRisk = ''
  if (parsed.tradeTP === undefined) parsed.tradeTP = ''
  if (!parsed.subtitle) parsed.subtitle = 'Rules + Checklist'
  if (!parsed.newsTime) parsed.newsTime = '--:--'
  if (parsed.newsActive === undefined) parsed.newsActive = false
  if (parsed.lowImp === undefined) parsed.lowImp = false
  if (parsed.highImp === undefined) parsed.highImp = false
  if (!parsed.currency) parsed.currency = 'USD'
  if (parsed.profitTarget === undefined) parsed.profitTarget = ''
  if (parsed.profitTargetB === undefined) parsed.profitTargetB = ''
  if (parsed.maxLossGBP === undefined) parsed.maxLossGBP = ''
  if (parsed.maxLossUSD === undefined) parsed.maxLossUSD = ''
  if (parsed.riskPerTrade === undefined) parsed.riskPerTrade = ''
  if (parsed.aimsDone === undefined) parsed.aimsDone = false
  if (parsed.tradeQuotaA === undefined) parsed.tradeQuotaA = ''
  if (parsed.tradeQuotaB === undefined) parsed.tradeQuotaB = ''
  // Session checklist is always reset to defaults on load — it's a per-session template
  parsed.sessionChecklist = JSON.parse(JSON.stringify(DEFAULT.sessionChecklist))
  if (parsed.checklist && !parsed.tradeChecklist) {
    parsed.tradeChecklist = parsed.checklist.map(normalizeItem).slice(4)
    delete parsed.checklist
  } else {
    parsed.tradeChecklist = (parsed.tradeChecklist || []).map(normalizeItem)
  }
  return parsed
}

function freshState() {
  return JSON.parse(JSON.stringify(DEFAULT))
}

function genPageId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function makePage(name, state) {
  return { id: genPageId(), name, history: { past: [], present: state || freshState(), future: [] } }
}

function freshRoot() {
  const page = makePage('Page 1', freshState())
  return { pages: [page], activeId: page.id }
}

// Build a page's runtime shape (with empty history) from persisted data.
function pageFromPersisted(p, fallbackName) {
  return {
    id: p.id || genPageId(),
    name: p.name || fallbackName,
    history: { past: [], present: migrateState(p.state || {}), future: [] },
  }
}

function loadRoot() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      const parsed = JSON.parse(s)
      // New multi-page shape
      if (parsed && Array.isArray(parsed.pages)) {
        const pages = parsed.pages.map((p, i) => pageFromPersisted(p, `Page ${i + 1}`))
        if (!pages.length) return freshRoot()
        const activeId = pages.some(p => p.id === parsed.activeId) ? parsed.activeId : pages[0].id
        return { pages, activeId }
      }
      // Legacy single-page shape → wrap into one page
      const page = makePage('Page 1', migrateState(parsed))
      return { pages: [page], activeId: page.id }
    }
  } catch (e) {}
  return freshRoot()
}

function rootReducer(root, action) {
  switch (action.type) {
    case 'ADD_PAGE': {
      const page = makePage(`Page ${root.pages.length + 1}`, freshState())
      return { pages: [...root.pages, page], activeId: page.id }
    }
    case 'SWITCH_PAGE':
      return root.pages.some(p => p.id === action.id) ? { ...root, activeId: action.id } : root
    case 'RENAME_PAGE': {
      const name = action.name.trim()
      if (!name) return root
      return { ...root, pages: root.pages.map(p => (p.id === action.id ? { ...p, name } : p)) }
    }
    case 'DELETE_PAGE': {
      if (root.pages.length <= 1) return root
      const idx = root.pages.findIndex(p => p.id === action.id)
      if (idx === -1) return root
      const pages = root.pages.filter(p => p.id !== action.id)
      let activeId = root.activeId
      if (activeId === action.id) {
        activeId = (pages[idx] || pages[idx - 1] || pages[0]).id
      }
      return { pages, activeId }
    }
    default: {
      // Route every other action to the active page's history reducer
      const idx = root.pages.findIndex(p => p.id === root.activeId)
      if (idx === -1) return root
      const page = root.pages[idx]
      const newHistory = historyReducer(page.history, action)
      if (newHistory === page.history) return root
      const pages = root.pages.slice()
      pages[idx] = { ...page, history: newHistory }
      return { ...root, pages }
    }
  }
}

export default function App() {
  const [root, dispatch] = useReducer(rootReducer, null, loadRoot)
  const activePage = root.pages.find(p => p.id === root.activeId) || root.pages[0]
  const { present: state, past, future } = activePage.history
  const canUndo = past.length > 0
  const canRedo = future.length > 0

  useEffect(() => {
    try {
      const persist = {
        pages: root.pages.map(p => ({ id: p.id, name: p.name, state: p.history.present })),
        activeId: root.activeId,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
    } catch (e) {}
  }, [root])

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      dispatch({ type: 'UNDO' })
    }
    if (
      (e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))
    ) {
      e.preventDefault()
      dispatch({ type: 'REDO' })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AppContext.Provider value={{ state, dispatch, canUndo, canRedo }}>
      <div className="app">
        <TabBar pages={root.pages} activeId={root.activeId} dispatch={dispatch} />
        <div className="header-row">
          <div className="header-controls">
            <button className="reset-btn" onClick={() => dispatch({ type: 'RESET_ALL' })}>
              Reset all checks
            </button>
            <div className="history-btns">
              <button className="history-btn" onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
              <button className="history-btn" onClick={() => dispatch({ type: 'REDO' })} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
            </div>
          </div>
          <Header />
        </div>
        <div className="columns">
          <ChecklistColumn />
          <RulesColumn />
        </div>
      </div>
      <Timer />
    </AppContext.Provider>
  )
}
