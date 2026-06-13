import { useReducer, useEffect } from 'react'
import { AppContext, reducer, DEFAULT } from './context/AppContext'
import Header from './components/Header'
import ChecklistColumn from './components/ChecklistColumn'
import RulesColumn from './components/RulesColumn'
import Timer from './components/Timer'

function loadState() {
  try {
    const s = localStorage.getItem('fxboyz')
    if (s) {
      const parsed = JSON.parse(s)
      if (!parsed.marketCondition) parsed.marketCondition = ''
      if (!parsed.marketBias) parsed.marketBias = ''
      parsed.checklist = parsed.checklist.map(item => ({
        options: [],
        ...item,
        selectedOptions: Array.isArray(item.selectedOptions)
          ? item.selectedOptions
          : item.selectedOption
          ? [item.selectedOption]
          : [],
      }))
      return parsed
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT))
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    try { localStorage.setItem('fxboyz', JSON.stringify(state)) } catch (e) {}
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="app">
        <Header />
        <div className="columns">
          <ChecklistColumn />
          <RulesColumn />
        </div>
        <button className="reset-btn" onClick={() => dispatch({ type: 'RESET_ALL' })}>
          Reset all checks
        </button>
      </div>
      <Timer />
    </AppContext.Provider>
  )
}
