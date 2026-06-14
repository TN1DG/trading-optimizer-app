import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

function to12h(time24) {
  if (!time24 || time24 === '--:--') return '--:--'
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export default function NewsPanel() {
  const { state, dispatch } = useApp()
  const [editingTime, setEditingTime] = useState(false)
  const timeInputRef = useRef(null)

  function startEditTime() {
    setEditingTime(true)
    setTimeout(() => timeInputRef.current?.showPicker?.(), 0)
  }

  function commitTime(e) {
    dispatch({ type: 'SET_NEWS_TIME', payload: e.target.value || '--:--' })
    setEditingTime(false)
  }

  return (
    <div className="news-panel">
      <div className="news-top">
        <button className="news-btn">News</button>
        {editingTime ? (
          <input
            ref={timeInputRef}
            className="news-time-input"
            type="time"
            defaultValue={state.newsTime !== '--:--' ? state.newsTime : ''}
            onChange={commitTime}
            onBlur={() => setEditingTime(false)}
            autoFocus
          />
        ) : (
          <span className="news-time" onDoubleClick={startEditTime}>{to12h(state.newsTime)}</span>
        )}
      </div>
      <div className="news-imp-btns">
        <button
          className={`imp-btn low${state.lowImp ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_LOW_IMP' })}
        >
          Low Imp
        </button>
        <button
          className={`imp-btn high${state.highImp ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_HIGH_IMP' })}
        >
          High Imp
        </button>
      </div>
    </div>
  )
}
