import { useApp } from '../context/AppContext'

const CURRENCIES = [
  { label: '$', value: 'USD' },
  { label: '£', value: 'GBP' },
]

export default function SidePanel() {
  const { state, dispatch } = useApp()
  const isGBP = state.currency === 'GBP'
  const sym = isGBP ? '£' : '$'

  return (
    <div className="side-panel">
      <div className="side-panel-title">Aims</div>
      <div className="currency-toggle">
        {CURRENCIES.map(c => (
          <button
            key={c.value}
            className={`currency-btn${state.currency === c.value ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_CURRENCY', payload: c.value })}
          >
            {c.label}
          </button>
        ))}
      </div>

      <table className="side-table">
        <tbody>
          <tr>
            <td className="side-table-label">Profit Target</td>
            <td colSpan={2} className="side-table-input-cell">
              <div className="max-loss-row">
                <span className="max-loss-sym">{sym}</span>
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={state.profitTarget ?? ''}
                  onChange={e => dispatch({ type: 'SET_PROFIT_TARGET', payload: e.target.value })}
                />
                <span className="max-loss-sep">/</span>
                <span className="max-loss-sym">{sym}</span>
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={state.profitTargetB ?? ''}
                  onChange={e => dispatch({ type: 'SET_PROFIT_TARGET_B', payload: e.target.value })}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td className="side-table-label">Max Loss</td>
            <td colSpan={2} className="side-table-input-cell">
              <div className="max-loss-row">
                <span className="max-loss-sym">{sym}</span>
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={state.maxLossGBP ?? ''}
                  onChange={e => dispatch({ type: 'SET_MAX_LOSS_GBP', payload: e.target.value })}
                />
                <span className="max-loss-sep">/</span>
                <span className="max-loss-sym">{sym}</span>
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={state.maxLossUSD ?? ''}
                  onChange={e => dispatch({ type: 'SET_MAX_LOSS_USD', payload: e.target.value })}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td className="side-table-label">Trade Quota</td>
            <td colSpan={2} className="side-table-input-cell">
              <div className="max-loss-row">
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={state.tradeQuotaA ?? ''}
                  onChange={e => dispatch({ type: 'SET_TRADE_QUOTA_A', payload: e.target.value })}
                />
                <span className="max-loss-sep">/</span>
                <input
                  className="side-table-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={state.tradeQuotaB ?? ''}
                  onChange={e => dispatch({ type: 'SET_TRADE_QUOTA_B', payload: e.target.value })}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
