import { useRef } from 'react'

export default function OptionsEditor({ options, onAdd, onEdit, onDelete }) {
  const inputRef = useRef(null)

  function handleAdd() {
    const val = inputRef.current?.value.trim()
    if (!val) return
    onAdd(val)
    if (inputRef.current) inputRef.current.value = ''
    inputRef.current?.focus()
  }

  return (
    <div className="opts-editor" onClick={e => e.stopPropagation()}>
      <div className="opts-editor-title">Options</div>

      {options.length === 0 && (
        <div className="opts-empty">No options yet — add one below.</div>
      )}

      {options.map((opt, oi) => (
        <div className="opt-row" key={oi}>
          <input
            defaultValue={opt}
            onBlur={e => onEdit(oi, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
          />
          <button className="opt-del" onClick={() => onDelete(oi)}>&#10005;</button>
        </div>
      ))}

      <div className="add-opt-row">
        <input
          ref={inputRef}
          placeholder="New option..."
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
        />
        <button className="add-opt-btn" onClick={handleAdd}>Add</button>
      </div>
    </div>
  )
}
