import { createContext, useContext } from 'react'

export const DEFAULT = {
  marketCondition: '',
  marketBias: '',
  checklist: [
    { id: 1, text: 'Ranging or trending (Bull/Bear)', checked: false, options: [], selectedOptions: [] },
    { id: 2, text: 'Mark the following', checked: false, options: [], selectedOptions: [] },
    { id: 3, text: 'Break out', checked: false, options: [], selectedOptions: [] },
    { id: 4, text: 'Daily H+L, Session H+L', checked: false, options: [], selectedOptions: [] },
    { id: 5, text: 'Order blocks & Breaker blocks', checked: false, options: [], selectedOptions: [] },
    { id: 6, text: 'Support + Resistance', checked: false, options: [], selectedOptions: [] },
    { id: 7, text: 'Higher time frame block', checked: false, options: [], selectedOptions: [] },
    { id: 8, text: 'Apply volume tool', checked: false, options: [], selectedOptions: [] },
  ],
  rules: [
    { id: 101, text: 'Do not enter rushed', checked: false },
    { id: 102, text: '20 minute timer after loss', checked: false },
    { id: 103, text: 'Do not reuse blocks over 2 times', checked: false },
    { id: 104, text: 'Rule 4 — tap to edit', checked: false },
    { id: 105, text: 'Rule 5 — tap to edit', checked: false },
    { id: 106, text: 'Rule 6 — tap to edit', checked: false },
  ],
}

function nextId(items) {
  return items.length ? Math.max(...items.map(x => x.id)) + 1 : 1
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_MARKET_CONDITION':
      return { ...state, marketCondition: state.marketCondition === action.payload ? '' : action.payload }

    case 'SET_MARKET_BIAS':
      return { ...state, marketBias: state.marketBias === action.payload ? '' : action.payload }

    case 'TOGGLE_ITEM':
      return {
        ...state,
        [action.col]: state[action.col].map(item =>
          item.id === action.id ? { ...item, checked: !item.checked } : item
        ),
      }

    case 'ADD_ITEM': {
      const newItem = {
        id: nextId(state[action.col]),
        text: action.text,
        checked: false,
        ...(action.col === 'checklist' ? { options: [], selectedOptions: [] } : {}),
      }
      return { ...state, [action.col]: [...state[action.col], newItem] }
    }

    case 'DELETE_ITEM':
      return { ...state, [action.col]: state[action.col].filter(item => item.id !== action.id) }

    case 'RENAME_ITEM':
      return {
        ...state,
        [action.col]: state[action.col].map(item =>
          item.id === action.id ? { ...item, text: action.text } : item
        ),
      }

    case 'REORDER_ITEMS': {
      const arr = [...state[action.col]]
      const from = arr.findIndex(x => x.id === action.fromId)
      const to = arr.findIndex(x => x.id === action.toId)
      if (from === -1 || to === -1 || from === to) return state
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...state, [action.col]: arr }
    }

    case 'ADD_OPTION':
      return {
        ...state,
        checklist: state.checklist.map(item =>
          item.id === action.id ? { ...item, options: [...item.options, action.value] } : item
        ),
      }

    case 'DELETE_OPTION':
      return {
        ...state,
        checklist: state.checklist.map(item => {
          if (item.id !== action.id) return item
          const removed = item.options[action.optIndex]
          return {
            ...item,
            options: item.options.filter((_, i) => i !== action.optIndex),
            selectedOptions: item.selectedOptions.filter(o => o !== removed),
          }
        }),
      }

    case 'EDIT_OPTION':
      return {
        ...state,
        checklist: state.checklist.map(item => {
          if (item.id !== action.id) return item
          const old = item.options[action.optIndex]
          const val = action.value.trim()
          if (!val) {
            return {
              ...item,
              options: item.options.filter((_, i) => i !== action.optIndex),
              selectedOptions: item.selectedOptions.filter(o => o !== old),
            }
          }
          return {
            ...item,
            options: item.options.map((o, i) => (i === action.optIndex ? val : o)),
            selectedOptions: item.selectedOptions.map(o => (o === old ? val : o)),
          }
        }),
      }

    case 'TOGGLE_OPTION':
      return {
        ...state,
        checklist: state.checklist.map(item => {
          if (item.id !== action.id) return item
          const sel = item.selectedOptions.includes(action.value)
            ? item.selectedOptions.filter(o => o !== action.value)
            : [...item.selectedOptions, action.value]
          return { ...item, selectedOptions: sel }
        }),
      }

    case 'RESET_ALL':
      return {
        ...state,
        checklist: state.checklist.map(item => ({ ...item, checked: false })),
        rules: state.rules.map(item => ({ ...item, checked: false })),
      }

    default:
      return state
  }
}

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
