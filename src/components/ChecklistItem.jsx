import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import OptionsEditor from './OptionsEditor'

let dragSrc = null

export default function ChecklistItem({ item, index, col }) {
  const { dispatch } = useApp()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const editInputRef = useRef(null)

  const hasChips = item.options && item.options.length > 0

  function startEdit(e) {
    e.stopPropagation()
    setEditVal(item.text)
    setEditing(true)
    setTimeout(() => { editInputRef.current?.select() }, 0)
  }

  function commitEdit() {
    const val = editVal.trim()
    if (val && val !== item.text) dispatch({ type: 'RENAME_ITEM', col, id: item.id, text: val })
    setEditing(false)
  }

  function handleEditKeyDown(e) {
    e.stopPropagation()
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') setEditing(false)
  }

  function handleItemClick() {
    if (editing) return
    dispatch({ type: 'TOGGLE_ITEM', col, id: item.id })
  }

  function handleDragStart(e) {
    dragSrc = { id: item.id, col }
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, col }))
  }

  function handleDragEnd() {
    dragSrc = null
    setIsDragging(false)
    setIsDragOver(false)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (dragSrc !== null && dragSrc.id !== item.id) {
      dispatch({ type: 'REORDER_ITEMS', col, fromId: dragSrc.id, toId: item.id })
    }
    dragSrc = null
  }

  const wrapClass = [
    'item-wrap',
    hasChips ? 'has-chips' : '',
    editorOpen ? 'editor-open' : '',
  ].filter(Boolean).join(' ')

  const itemClass = [
    'item',
    item.checked ? 'checked' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapClass}>
      <div
        className={itemClass}
        draggable
        onClick={handleItemClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="drag-handle" aria-hidden="true">
          <i className="ti ti-grip-vertical" />
        </span>
        <span className="item-num">{index + 1}</span>
        <span className="star" aria-hidden="true">✦</span>

        {editing ? (
          <input
            ref={editInputRef}
            className="item-edit-input"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="item-text" onDoubleClick={startEdit}>
            {item.text}
          </span>
        )}

        <button
          className={`opts-btn${editorOpen ? ' active' : ''}`}
          title="Manage options"
          onClick={e => { e.stopPropagation(); setEditorOpen(o => !o) }}
        >
          &#9776;
        </button>

        <button
          className="del-btn"
          aria-label="Delete item"
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_ITEM', col, id: item.id }) }}
        >
          &#x2715;
        </button>
      </div>

      {hasChips && (
        <div className="item-chips" onClick={e => e.stopPropagation()}>
          {item.options.map(opt => (
            <button
              key={opt}
              className={`chip${item.selectedOptions.includes(opt) ? ' selected' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_OPTION', id: item.id, value: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {editorOpen && (
        <OptionsEditor
          options={item.options}
          onAdd={val => dispatch({ type: 'ADD_OPTION', id: item.id, value: val })}
          onEdit={(oi, val) => dispatch({ type: 'EDIT_OPTION', id: item.id, optIndex: oi, value: val })}
          onDelete={oi => dispatch({ type: 'DELETE_OPTION', id: item.id, optIndex: oi })}
        />
      )}
    </div>
  )
}
