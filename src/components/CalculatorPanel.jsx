import { useState } from 'react'

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
    default: return b
  }
}

// Trim float noise (e.g. 0.1 + 0.2) without forcing trailing zeros
function fmt(n) {
  if (!isFinite(n)) return 'Err'
  return String(parseFloat(n.toPrecision(12)))
}

const KEYS = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '=', '+'],
]
const OPS = ['+', '−', '×', '÷']

export default function CalculatorPanel() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [ans, setAns] = useState('0')

  function inputDigit(d) {
    if (display === 'Err') { setDisplay(d); setWaiting(false); return }
    if (waiting) { setDisplay(d); setWaiting(false) }
    else setDisplay(display === '0' ? d : display + d)
  }

  function inputDot() {
    if (display === 'Err') { setDisplay('0.'); setWaiting(false); return }
    if (waiting) { setDisplay('0.'); setWaiting(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  function clearAll() {
    setDisplay('0'); setPrev(null); setOp(null); setWaiting(false)
  }

  function chooseOp(nextOp) {
    const cur = parseFloat(display)
    if (op && waiting) { setOp(nextOp); return }
    if (prev === null) {
      setPrev(cur)
    } else if (op) {
      const r = compute(prev, cur, op)
      setPrev(r)
      setDisplay(fmt(r))
    }
    setWaiting(true)
    setOp(nextOp)
  }

  function equals() {
    if (op === null || prev === null) return
    const cur = parseFloat(display)
    const r = compute(prev, cur, op)
    setDisplay(fmt(r))
    setAns(fmt(r))
    setPrev(null); setOp(null); setWaiting(true)
  }

  function inputAns() {
    setDisplay(ans)
    setWaiting(false)
  }

  function handleKey(k) {
    if (k === '=') equals()
    else if (k === '.') inputDot()
    else if (OPS.includes(k)) chooseOp(k)
    else inputDigit(k)
  }

  return (
    <div className="calc-panel">
      <div className="ms-panel-title">Calculator</div>
      <div className="calc-display">{display}</div>
      <div className="calc-keys">
        {KEYS.flat().map(k => (
          <button
            key={k}
            className={`calc-key${OPS.includes(k) ? ' op' : ''}${k === '=' ? ' eq' : ''}`}
            onClick={() => handleKey(k)}
          >{k}</button>
        ))}
        <button className="calc-key ans" onClick={inputAns}>Ans</button>
        <button className="calc-key clear" onClick={clearAll}>C</button>
      </div>
    </div>
  )
}
