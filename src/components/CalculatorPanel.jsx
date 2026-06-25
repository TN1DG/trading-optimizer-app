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

function fmt(n) {
  if (!isFinite(n)) return 'Err'
  return n.toFixed(2)
}

const KEYS = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '=', '+'],
]
const OPS = ['+', '−', '×', '÷']

export default function CalculatorPanel() {
  const [display, setDisplay] = useState('0')   // visual label (may be 'Ans' or 'Err')
  const [val, setVal] = useState(0)              // numeric value behind display
  const [prev, setPrev] = useState(null)         // stored left operand
  const [prevLabel, setPrevLabel] = useState('') // display string when prev was captured
  const [op, setOp] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [ans, setAns] = useState(0)
  const [expr, setExpr] = useState('')

  function setNum(label, num) {
    setDisplay(label)
    setVal(num)
  }

  function inputDigit(d) {
    if (display === 'Err') { setNum(d, parseFloat(d)); setWaiting(false); return }
    if (waiting || display === 'Ans') {
      setNum(d, parseFloat(d))
      setWaiting(false)
    } else {
      const next = display === '0' ? d : display + d
      setDisplay(next)
      setVal(parseFloat(next))
    }
  }

  function inputDot() {
    if (display === 'Err' || display === 'Ans' || waiting) {
      setDisplay('0.'); setVal(0); setWaiting(false); return
    }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  function clearAll() {
    setNum('0', 0); setPrev(null); setPrevLabel(''); setOp(null); setWaiting(false); setExpr('')
  }

  function chooseOp(nextOp) {
    if (op && waiting) {
      setOp(nextOp)
      setExpr(prevLabel + ' ' + nextOp)
      return
    }
    if (prev === null) {
      setPrev(val)
      setPrevLabel(display)
      setExpr(display + ' ' + nextOp)
    } else if (op) {
      const r = compute(prev, val, op)
      const rLabel = fmt(r)
      setPrev(r)
      setPrevLabel(rLabel)
      setNum(rLabel, r)
      setExpr(rLabel + ' ' + nextOp)
    }
    setWaiting(true)
    setOp(nextOp)
  }

  function equals() {
    if (op === null || prev === null) return
    const r = compute(prev, val, op)
    const rLabel = fmt(r)
    setExpr(prevLabel + ' ' + op + ' ' + display + ' =')
    setNum(rLabel, r)
    setAns(r)
    setPrev(null); setPrevLabel(''); setOp(null); setWaiting(true)
  }

  function inputAns() {
    setDisplay('Ans')
    setVal(ans)
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
      <div className="calc-display">
        <div className="calc-expr">{expr}</div>
        <div className="calc-number">{display}</div>
      </div>
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
