import { useState, useRef, useEffect } from 'react'

function fmt(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

export default function Timer() {
  const [left, setLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [showInputs, setShowInputs] = useState(true)
  const intervalRef = useRef(null)
  const minRef = useRef(null)
  const secRef = useRef(null)
  const leftRef = useRef(0)

  useEffect(() => {
    leftRef.current = left
  }, [left])

  function start() {
    if (running) return
    let seconds = left
    if (!done && left === 0) {
      const m = parseInt(minRef.current?.value) || 0
      const s = parseInt(secRef.current?.value) || 0
      seconds = m * 60 + s
      if (seconds <= 0) return
      setLeft(seconds)
      leftRef.current = seconds
    }
    setDone(false)
    setShowInputs(false)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      leftRef.current -= 1
      setLeft(leftRef.current)
      if (leftRef.current <= 0) {
        clearInterval(intervalRef.current)
        setRunning(false)
        setDone(true)
      }
    }, 1000)
  }

  function pause() {
    clearInterval(intervalRef.current)
    setRunning(false)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setDone(false)
    setLeft(0)
    leftRef.current = 0
    setShowInputs(true)
    if (minRef.current) minRef.current.value = ''
    if (secRef.current) secRef.current.value = ''
  }

  return (
    <div
      id="timer-bar"
      className={done ? 'done' : ''}
      onClick={done ? reset : undefined}
    >
      <span className="timer-label">Timer</span>
      <div id="timer-display">{fmt(left)}</div>

      {showInputs && (
        <div className="timer-set">
          <input
            ref={minRef}
            type="number"
            min="0"
            max="99"
            placeholder="mm"
            onKeyDown={e => { if (e.key === 'Enter') start() }}
          />
          <span>:</span>
          <input
            ref={secRef}
            type="number"
            min="0"
            max="59"
            placeholder="ss"
            onKeyDown={e => { if (e.key === 'Enter') start() }}
          />
        </div>
      )}

      <div className="timer-btns">
        {!running && !done && (
          <button className="timer-btn go" onClick={start}>
            {left > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        {running && (
          <button className="timer-btn" onClick={pause}>Pause</button>
        )}
        <button className="timer-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
