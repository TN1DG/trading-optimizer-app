import { useReducer, useEffect, useCallback } from 'react'
import { AppContext, reducer, DEFAULT } from './context/AppContext'
import Header from './components/Header'
import ChecklistColumn from './components/ChecklistColumn'
import RulesColumn from './components/RulesColumn'
import Timer from './components/Timer'

const HISTORY_LIMIT = 50

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

function loadState() {
  try {
    const s = localStorage.getItem('fxboyz')
    if (s) {
      const parsed = JSON.parse(s)
      if (!parsed.marketCondition) parsed.marketCondition = ''
      if (!parsed.marketBias) parsed.marketBias = ''
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
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT))
}

function initHistory() {
  return { past: [], present: loadState(), future: [] }
}

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, null, initHistory)
  const { present: state, past, future } = history
  const canUndo = past.length > 0
  const canRedo = future.length > 0

  useEffect(() => {
    try { localStorage.setItem('fxboyz', JSON.stringify(state)) } catch (e) {}
  }, [state])

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
        <Header />
        <div className="columns">
          <ChecklistColumn />
          <RulesColumn />
        </div>
        <div className="bottom-bar">
          <button className="reset-btn" onClick={() => dispatch({ type: 'RESET_ALL' })}>
            Reset all checks
          </button>
          <div className="history-btns">
            <button className="history-btn" onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
            <button className="history-btn" onClick={() => dispatch({ type: 'REDO' })} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
          </div>
        </div>
      </div>
      <Timer />
    </AppContext.Provider>
  )
}
