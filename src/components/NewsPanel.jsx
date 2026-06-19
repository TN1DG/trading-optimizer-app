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
      <div className="ms-panel-title">Research</div>
      <div className="news-top">
        <button
          className={`news-btn${state.newsActive ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_NEWS' })}
        >News</button>
        <a
          className="stocks-btn"
          href="https://www.forexfactory.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Forex Factory news"
          aria-label="Forex Factory news"
        >
          <svg width="20" height="16" viewBox="0 0 24 18" fill="none" aria-hidden="true">
            {/* up candle */}
            <line x1="7" y1="2" x2="7" y2="16" stroke="#4ade80" strokeWidth="1.5" />
            <rect x="4.5" y="5" width="5" height="7" fill="#4ade80" />
            {/* down candle */}
            <line x1="17" y1="3" x2="17" y2="17" stroke="#f87171" strokeWidth="1.5" />
            <rect x="14.5" y="8" width="5" height="6" fill="#f87171" />
          </svg>
        </a>
        <div className="news-time-box">
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
