import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

let dragSrcId = null

export default function RuleItem({ item, index, col }) {
  const { dispatch } = useApp()
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  function startEdit(e) {
    e.stopPropagation()
    setEditVal(item.text)
    setEditing(true)
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

  function handleDragStart(e) {
    dragSrcId = item.id
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    dragSrcId = null
    setIsDragging(false)
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    if (dragSrcId !== null && dragSrcId !== item.id) {
      dispatch({ type: 'REORDER_ITEMS', col, fromId: dragSrcId, toId: item.id })
    }
    dragSrcId = null
  }

  const itemClass = [
    'item',
    item.checked ? 'checked' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="item-wrap">
      <div
        className={itemClass}
        draggable
        onClick={() => { if (!editing) dispatch({ type: 'TOGGLE_ITEM', col, id: item.id }) }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="drag-handle" aria-hidden="true">
          <i className="ti ti-grip-vertical" />
        </span>
        <span className="item-num">{index + 1}</span>
        <span className="star" aria-hidden="true">✦</span>

        {editing ? (
          <input
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
          className="del-btn"
          aria-label="Delete rule"
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_ITEM', col, id: item.id }) }}
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}
