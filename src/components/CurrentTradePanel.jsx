import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

function fmt(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CurrentTradePanel() {
  const { state, dispatch } = useApp()
  const tradeOpen = state.tradeDirection === 'buy' || state.tradeDirection === 'sell'
  // BE: solid yellow once activated; flickers while a trade is open but not yet activated; grey otherwise
  const beClass = state.tradeBE ? ' active' : tradeOpen ? ' flicker' : ''
  const sym = state.currency === 'GBP' ? '£' : '$'

  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function resetStopwatch() {
    setRunning(false)
    setElapsed(0)
  }

  return (
    <div className="current-trade-panel">
      <div className="ms-panel-title">Current Trade</div>
      <div className="trade-btns">
        <button
          className={`trade-btn buy${state.tradeDirection === 'buy' ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_TRADE_DIRECTION', payload: 'buy' })}
        >Buy</button>
        <button
          className={`trade-btn be${beClass}`}
          onClick={() => dispatch({ type: 'TOGGLE_TRADE_BE' })}
        >BE</button>
        <button
          className={`trade-btn sell${state.tradeDirection === 'sell' ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_TRADE_DIRECTION', payload: 'sell' })}
        >Sell</button>
      </div>
      <div className="trade-inputs">
        <label className="trade-input-group">
          <span className="trade-input-label">Risk</span>
          <span className="max-loss-sym">{sym}</span>
          <input
            className="side-table-input trade-num"
            type="number"
            min="0"
            placeholder="0.00"
            value={state.tradeRisk ?? ''}
            onChange={e => dispatch({ type: 'SET_TRADE_RISK', payload: e.target.value })}
          />
        </label>
        <label className="trade-input-group">
          <span className="trade-input-label">TP</span>
          <span className="max-loss-sym">{sym}</span>
          <input
            className="side-table-input trade-num"
            type="number"
            min="0"
            placeholder="0.00"
            value={state.tradeTP ?? ''}
            onChange={e => dispatch({ type: 'SET_TRADE_TP', payload: e.target.value })}
          />
        </label>
      </div>
      <div className="trade-stopwatch">
        <span className="sw-display">{fmt(elapsed)}</span>
        <button className="sw-btn" onClick={() => setRunning(r => !r)}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button className="sw-btn" onClick={resetStopwatch}>Reset</button>
      </div>
    </div>
  )
}
