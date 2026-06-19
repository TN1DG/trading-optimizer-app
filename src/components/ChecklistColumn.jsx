import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import MarketBar from './MarketBar'
import ChecklistItem from './ChecklistItem'
import NewsPanel from './NewsPanel'
import SidePanel from './SidePanel'
import CurrentTradePanel from './CurrentTradePanel'
import CalculatorPanel from './CalculatorPanel'

const CONDITION_BUTTONS = [
  { label: 'Ranging', value: 'ranging', activeClass: 'ranging' },
  { label: 'Trending', value: 'trending', activeClass: 'trending' },
]

const BIAS_BUTTONS = [
  { label: 'Bullish', value: 'bull', activeClass: 'bull' },
  { label: 'Bearish', value: 'bear', activeClass: 'bear' },
]

// Panels that should grow to fill spare space; others size to their content.
const GROW_PANELS = new Set(['news', 'aims'])

export default function ChecklistColumn() {
  const { state, dispatch } = useApp()
  const sessionInputRef = useRef(null)
  const tradeInputRef = useRef(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [dragPanel, setDragPanel] = useState(null)
  const [dragOverPanel, setDragOverPanel] = useState(null)

  function handleAdd(col, inputRef) {
    const val = inputRef.current?.value.trim()
    if (!val) return
    dispatch({ type: 'ADD_ITEM', col, text: val })
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleSectionDragOver(e, col) {
    e.preventDefault()
    setDragOverCol(col)
  }

  function handleSectionDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null)
  }

  function handleSectionDrop(e, toCol) {
    e.preventDefault()
    setDragOverCol(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data?.id == null) return
      dispatch({ type: 'MOVE_ITEM_TO_COL', fromId: data.id, toCol })
    } catch { /* ignore invalid data */ }
  }

  // ── Panel reordering (drag the grip handle) ──────────────────────────────
  function handlePanelGripStart(e, key) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ panel: key }))
    // Drag the whole panel block as the drag image, not just the grip
    const block = e.currentTarget.parentElement
    if (block) e.dataTransfer.setDragImage(block, 12, 12)
    setDragPanel(key)
  }

  function handlePanelDragOver(e, key) {
    e.preventDefault()
    if (dragPanel && dragPanel !== key) setDragOverPanel(key)
  }

  function handlePanelDrop(e, toKey) {
    e.preventDefault()
    setDragOverPanel(null)
    let fromKey = dragPanel
    if (!fromKey) {
      try { fromKey = JSON.parse(e.dataTransfer.getData('text/plain'))?.panel } catch { /* ignore */ }
    }
    setDragPanel(null)
    if (fromKey && fromKey !== toKey) {
      dispatch({ type: 'REORDER_PANELS', fromKey, toKey })
    }
  }

  const PANELS = {
    currentTrade: <CurrentTradePanel />,
    marketStructure: (
      <div className="ms-panel">
        <div className="ms-panel-title">Market Structure</div>
        <MarketBar
          buttons={CONDITION_BUTTONS}
          current={state.marketCondition}
          onSelect={val => dispatch({ type: 'SET_MARKET_CONDITION', payload: val })}
        />
        <MarketBar
          buttons={BIAS_BUTTONS}
          current={state.marketBias}
          onSelect={val => dispatch({ type: 'SET_MARKET_BIAS', payload: val })}
        />
      </div>
    ),
    news: <NewsPanel />,
    aims: <SidePanel />,
    calculator: <CalculatorPanel />,
  }

  function renderPanel(key) {
    if (!PANELS[key]) return null
    return (
      <div
        key={key}
        data-panel={key}
        className={
          'panel-block' +
          (GROW_PANELS.has(key) ? ' pb-grow' : '') +
          (dragOverPanel === key ? ' panel-drag-over' : '')
        }
        onDragOver={e => handlePanelDragOver(e, key)}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverPanel(p => (p === key ? null : p)) }}
        onDrop={e => handlePanelDrop(e, key)}
      >
        <span
          className="panel-grip"
          title="Drag to reorder"
          draggable
          onDragStart={e => handlePanelGripStart(e, key)}
          onDragEnd={() => { setDragPanel(null); setDragOverPanel(null) }}
        >⠿</span>
        {PANELS[key]}
      </div>
    )
  }

  return (
    <div className="col">
      <div className="col-title">Checklist</div>

      <div className="checklist-body">
        <div className="checklist-section">
          <div className="section-title">Session Checklist</div>
          <div className="session-top">
            {state.panelOrder.map(renderPanel)}
          </div>
          <div
            id="session-list"
            className={`section-list${dragOverCol === 'sessionChecklist' ? ' drag-over' : ''}`}
            onDragOver={e => handleSectionDragOver(e, 'sessionChecklist')}
            onDragLeave={handleSectionDragLeave}
            onDrop={e => handleSectionDrop(e, 'sessionChecklist')}
          >
            {state.sessionChecklist.length === 0 && (
              <div className="drop-placeholder">Drop items here</div>
            )}
            {state.sessionChecklist.map((item, i) => (
              <ChecklistItem key={item.id} item={item} index={i} col="sessionChecklist" />
            ))}
          </div>
          <div className="add-row">
            <input
              ref={sessionInputRef}
              placeholder="Add session item..."
              onKeyDown={e => { if (e.key === 'Enter') handleAdd('sessionChecklist', sessionInputRef) }}
            />
            <button className="add-btn" onClick={() => handleAdd('sessionChecklist', sessionInputRef)}>Add</button>
          </div>
        </div>

        <div className="checklist-section">
          <div className="section-title">Trade Checklist</div>
          <div
            id="trade-list"
            className={`section-list${dragOverCol === 'tradeChecklist' ? ' drag-over' : ''}`}
            onDragOver={e => handleSectionDragOver(e, 'tradeChecklist')}
            onDragLeave={handleSectionDragLeave}
            onDrop={e => handleSectionDrop(e, 'tradeChecklist')}
          >
            {state.tradeChecklist.length === 0 && (
              <div className="drop-placeholder">Drop items here</div>
            )}
            {state.tradeChecklist.map((item, i) => (
              <ChecklistItem key={item.id} item={item} index={i} col="tradeChecklist" />
            ))}
          </div>
          <div className="add-row">
            <input
              ref={tradeInputRef}
              placeholder="Add trade item..."
              onKeyDown={e => { if (e.key === 'Enter') handleAdd('tradeChecklist', tradeInputRef) }}
            />
            <button className="add-btn" onClick={() => handleAdd('tradeChecklist', tradeInputRef)}>Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
