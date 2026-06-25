import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function to12h(time24) {
  if (!time24 || time24 === '--:--') return '--:--'
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function minutesUntil(time24) {
  if (!time24 || time24 === '--:--') return null
  const now = new Date()
  const [h, m] = time24.split(':').map(Number)
  const target = new Date()
  target.setHours(h, m, 0, 0)
  return (target - now) / 60000
}

function playAlarm(audioCtx) {
  let active = true
  let tid

  async function tick() {
    if (!active) return
    try {
      await audioCtx.resume()
      const now = audioCtx.currentTime
      ;[880, 1108].forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        const t = now + i * 0.22
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
        osc.start(t)
        osc.stop(t + 0.2)
      })
    } catch (_) {}
    tid = setTimeout(tick, 1200)
  }

  tick()
  return () => { active = false; clearTimeout(tid) }
}

export default function NewsPanel() {
  const { state, dispatch } = useApp()
  const [editingTime, setEditingTime] = useState(false)
  const [preWarn, setPreWarn] = useState(false)
  const timeInputRef = useRef(null)
  const audioCtxRef = useRef(null)
  const stopAlarmRef = useRef(null)
  const alarmActiveRef = useRef(false)
  // stores the newsTime value the user already dismissed, so we don't re-ring it
  const dismissedTimeRef = useRef(null)

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  function triggerAlarm() {
    if (alarmActiveRef.current) return
    alarmActiveRef.current = true
    setPreWarn(true)
    stopAlarmRef.current = playAlarm(getAudioCtx())
  }

  function silenceAlarm() {
    if (!alarmActiveRef.current) return
    alarmActiveRef.current = false
    stopAlarmRef.current?.()
    stopAlarmRef.current = null
    setPreWarn(false)
  }

  // Check every 30 seconds whether we're in the 15-minute pre-warn window
  useEffect(() => {
    function check() {
      const mins = minutesUntil(state.newsTime)
      const inWindow = mins !== null && mins >= 0 && mins <= 15
      const dismissed = dismissedTimeRef.current === state.newsTime

      if (inWindow && !dismissed) {
        triggerAlarm()
      } else {
        silenceAlarm()
      }
    }

    check()
    const id = setInterval(check, 30_000)
    return () => {
      clearInterval(id)
      silenceAlarm()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.newsTime])

  function startEditTime() {
    getAudioCtx() // warm up AudioContext on user gesture so it can play later
    setEditingTime(true)
    setTimeout(() => timeInputRef.current?.showPicker?.(), 0)
  }

  function commitTime(e) {
    dismissedTimeRef.current = null // new time resets dismissal
    dispatch({ type: 'SET_NEWS_TIME', payload: e.target.value || '--:--' })
    setEditingTime(false)
  }

  function handleNewsClick() {
    if (alarmActiveRef.current) {
      dismissedTimeRef.current = state.newsTime
      silenceAlarm()
    }
    dispatch({ type: 'TOGGLE_NEWS' })
  }

  return (
    <div className="news-panel">
      <div className="ms-panel-title">Research</div>
      <div className="news-top">
        <button
          className={`news-btn${state.newsActive ? ' active' : ''}`}
          onClick={handleNewsClick}
        >News</button>
        <a
          className={`stocks-btn${preWarn ? ' pre-warn' : ''}`}
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
