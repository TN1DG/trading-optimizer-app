import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import RuleItem from './RuleItem'

export default function RulesColumn() {
  const { state, dispatch } = useApp()
  const inputRef = useRef(null)

  function handleAdd() {
    const val = inputRef.current?.value.trim()
    if (!val) return
    dispatch({ type: 'ADD_ITEM', col: 'rules', text: val })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="col">
      <div className="col-title">Rules</div>

      <div id="rules-list">
        {state.rules.map((item, i) => (
          <RuleItem key={item.id} item={item} index={i} col="rules" />
        ))}
      </div>

      <div className="add-row">
        <input
          ref={inputRef}
          id="rules-input"
          placeholder="Add rule..."
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
        />
        <button className="add-btn" onClick={handleAdd}>Add</button>
      </div>
    </div>
  )
}
