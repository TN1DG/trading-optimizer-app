import { createContext, useContext } from 'react'

export const DEFAULT = {
  marketCondition: '',
  marketBias: '',
  subtitle: 'Rules + Checklist',
  newsTime: '--:--',
  newsActive: false,
  lowImp: false,
  highImp: false,
  currency: 'USD',
  profitTarget: '',
  profitTargetB: '',
  maxLossGBP: '',
  maxLossUSD: '',
  tradeQuotaA: '',
  tradeQuotaB: '',
  sessionChecklist: [
    {
      id: 1,
      text: 'MARK POIs',
      checked: false,
      options: ['Daily H+L', 'Session H+L', 'Support + Resistance', 'Order Blocks', 'Draws of Liquidity', 'Breaker Blocks'],
      selectedOptions: [],
    },
  ],
  tradeChecklist: [
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
    case 'SET_SUBTITLE':
      return { ...state, subtitle: action.payload }

    case 'SET_NEWS_TIME':
      return { ...state, newsTime: action.payload }

    case 'TOGGLE_NEWS':
      return { ...state, newsActive: !state.newsActive }

    case 'TOGGLE_LOW_IMP':
      return { ...state, lowImp: !state.lowImp }

    case 'TOGGLE_HIGH_IMP':
      return { ...state, highImp: !state.highImp }

    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }

    case 'SET_PROFIT_TARGET':
      return { ...state, profitTarget: action.payload }

    case 'SET_PROFIT_TARGET_B':
      return { ...state, profitTargetB: action.payload }

    case 'SET_MAX_LOSS_GBP':
      return { ...state, maxLossGBP: action.payload }

    case 'SET_MAX_LOSS_USD':
      return { ...state, maxLossUSD: action.payload }

    case 'SET_TRADE_QUOTA_A':
      return { ...state, tradeQuotaA: action.payload }

    case 'SET_TRADE_QUOTA_B':
      return { ...state, tradeQuotaB: action.payload }

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
      const isChecklist = action.col === 'sessionChecklist' || action.col === 'tradeChecklist'
      const allChecklistItems = isChecklist ? [...state.sessionChecklist, ...state.tradeChecklist] : state[action.col]
      const newItem = {
        id: nextId(allChecklistItems),
        text: action.text,
        checked: false,
        ...(isChecklist ? { options: [], selectedOptions: [] } : {}),
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
      const srcCol = state.sessionChecklist.some(x => x.id === action.fromId)
        ? 'sessionChecklist'
        : state.tradeChecklist.some(x => x.id === action.fromId)
          ? 'tradeChecklist'
          : action.col
      const destArr = [...state[action.col]]
      const to = destArr.findIndex(x => x.id === action.toId)
      if (to === -1) return state
      if (srcCol === action.col) {
        const from = destArr.findIndex(x => x.id === action.fromId)
        if (from === -1 || from === to) return state
        const [moved] = destArr.splice(from, 1)
        destArr.splice(to, 0, moved)
        return { ...state, [action.col]: destArr }
      }
      const srcArr = [...state[srcCol]]
      const from = srcArr.findIndex(x => x.id === action.fromId)
      if (from === -1) return state
      const [moved] = srcArr.splice(from, 1)
      destArr.splice(to, 0, moved)
      return { ...state, [srcCol]: srcArr, [action.col]: destArr }
    }

    case 'MOVE_ITEM_TO_COL': {
      const CL_COLS = ['sessionChecklist', 'tradeChecklist']
      const srcCol = CL_COLS.find(c => state[c].some(x => x.id === action.fromId))
      if (!srcCol) return state
      const srcArr = [...state[srcCol]]
      const from = srcArr.findIndex(x => x.id === action.fromId)
      if (from === -1) return state
      const [moved] = srcArr.splice(from, 1)
      if (srcCol === action.toCol) return { ...state, [srcCol]: [...srcArr, moved] }
      return { ...state, [srcCol]: srcArr, [action.toCol]: [...state[action.toCol], moved] }
    }

    case 'ADD_OPTION': {
      const updateAdd = items => items.map(item =>
        item.id === action.id ? { ...item, options: [...item.options, action.value] } : item
      )
      return { ...state, sessionChecklist: updateAdd(state.sessionChecklist), tradeChecklist: updateAdd(state.tradeChecklist) }
    }

    case 'DELETE_OPTION': {
      const updateDel = items => items.map(item => {
        if (item.id !== action.id) return item
        const removed = item.options[action.optIndex]
        return {
          ...item,
          options: item.options.filter((_, i) => i !== action.optIndex),
          selectedOptions: item.selectedOptions.filter(o => o !== removed),
        }
      })
      return { ...state, sessionChecklist: updateDel(state.sessionChecklist), tradeChecklist: updateDel(state.tradeChecklist) }
    }

    case 'EDIT_OPTION': {
      const updateEdit = items => items.map(item => {
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
      })
      return { ...state, sessionChecklist: updateEdit(state.sessionChecklist), tradeChecklist: updateEdit(state.tradeChecklist) }
    }

    case 'TOGGLE_OPTION': {
      const updateToggle = items => items.map(item => {
        if (item.id !== action.id) return item
        const sel = item.selectedOptions.includes(action.value)
          ? item.selectedOptions.filter(o => o !== action.value)
          : [...item.selectedOptions, action.value]
        return { ...item, selectedOptions: sel }
      })
      return { ...state, sessionChecklist: updateToggle(state.sessionChecklist), tradeChecklist: updateToggle(state.tradeChecklist) }
    }

    case 'RESET_ALL':
      return {
        ...state,
        sessionChecklist: state.sessionChecklist.map(item => ({ ...item, checked: false })),
        tradeChecklist: state.tradeChecklist.map(item => ({ ...item, checked: false })),
        rules: state.rules.map(item => ({ ...item, checked: false })),
      }

    default:
      return state
  }
}

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
