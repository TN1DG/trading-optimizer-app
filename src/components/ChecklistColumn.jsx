import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import MarketBar from './MarketBar'
import ChecklistItem from './ChecklistItem'

const CONDITION_BUTTONS = [
  { label: 'Ranging', value: 'ranging', activeClass: 'ranging' },
  { label: 'Trending', value: 'trending', activeClass: 'trending' },
]

const BIAS_BUTTONS = [
  { label: 'Bull', value: 'bull', activeClass: 'bull' },
  { label: 'Bear', value: 'bear', activeClass: 'bear' },
]

export default function ChecklistColumn() {
  const { state, dispatch } = useApp()
  const inputRef = useRef(null)

  function handleAdd() {
    const val = inputRef.current?.value.trim()
    if (!val) return
    dispatch({ type: 'ADD_ITEM', col: 'checklist', text: val })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="col">
      <div className="col-title">Checklist</div>

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

      <div id="checklist-list">
        {state.checklist.map((item, i) => (
          <ChecklistItem key={item.id} item={item} index={i} col="checklist" />
        ))}
      </div>

      <div className="add-row">
        <input
          ref={inputRef}
          id="checklist-input"
          placeholder="Add checklist item..."
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
        />
        <button className="add-btn" onClick={handleAdd}>Add</button>
      </div>
    </div>
  )
}
