import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const { state, dispatch } = useApp()
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const inputRef = useRef(null)

  function startEdit() {
    setVal(state.subtitle)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const trimmed = val.trim().toUpperCase()
    if (trimmed) dispatch({ type: 'SET_SUBTITLE', payload: trimmed })
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="header">
      <h1>Goldilocks Composure Tool</h1>
      <div className="subtitle-container">
        {editing ? (
          <input
            ref={inputRef}
            className="subtitle-input"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <p className="subtitle" onDoubleClick={startEdit}>{state.subtitle}</p>
        )}
      </div>
    </div>
  )
}
