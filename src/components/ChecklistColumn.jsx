import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import MarketBar from './MarketBar'
import ChecklistItem from './ChecklistItem'
import NewsPanel from './NewsPanel'
import SidePanel from './SidePanel'

const CONDITION_BUTTONS = [
  { label: 'Ranging', value: 'ranging', activeClass: 'ranging' },
  { label: 'Trending', value: 'trending', activeClass: 'trending' },
]

const BIAS_BUTTONS = [
  { label: 'Bullish', value: 'bull', activeClass: 'bull' },
  { label: 'Bearish', value: 'bear', activeClass: 'bear' },
]

export default function ChecklistColumn() {
  const { state, dispatch } = useApp()
  const sessionInputRef = useRef(null)
  const tradeInputRef = useRef(null)
  const [dragOverCol, setDragOverCol] = useState(null)

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

  return (
    <div className="col">
      <div className="col-title">Checklist</div>

      <div className="checklist-body">
        <div className="checklist-section">
          <div className="section-title">Session Checklist</div>
          <div className="session-top">
            <SidePanel />
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
            <NewsPanel />
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
