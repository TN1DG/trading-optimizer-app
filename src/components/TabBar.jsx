import { useState, useRef, useEffect } from 'react'

export default function TabBar({ pages, activeId, dispatch }) {
  const [editingId, setEditingId] = useState(null)
  const [val, setVal] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingId != null) inputRef.current?.select()
  }, [editingId])

  function startEdit(page) {
    setVal(page.name)
    setEditingId(page.id)
  }

  function commit() {
    if (editingId == null) return
    dispatch({ type: 'RENAME_PAGE', id: editingId, name: val })
    setEditingId(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditingId(null)
  }

  function closePage(e, page) {
    e.stopPropagation()
    if (window.confirm(`Close "${page.name}"? Its checklist and rules will be lost.`)) {
      dispatch({ type: 'DELETE_PAGE', id: page.id })
    }
  }

  return (
    <div className="tab-bar">
      {pages.map(page => {
        const active = page.id === activeId
        const isEditing = editingId === page.id
        return (
          <div
            key={page.id}
            className={'tab' + (active ? ' active' : '')}
            onClick={() => dispatch({ type: 'SWITCH_PAGE', id: page.id })}
            onDoubleClick={() => startEdit(page)}
            title="Double-click to rename"
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className="tab-input"
                value={val}
                onChange={e => setVal(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="tab-label">{page.name}</span>
            )}
            {pages.length > 1 && !isEditing && (
              <button className="tab-close" title="Close page" onClick={e => closePage(e, page)}>×</button>
            )}
          </div>
        )
      })}
      <button className="tab-add" title="New page" onClick={() => dispatch({ type: 'ADD_PAGE' })}>+</button>
    </div>
  )
}
