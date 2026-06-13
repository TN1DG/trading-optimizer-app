export default function MarketBar({ buttons, current, onSelect }) {
  return (
    <div className="market-bar">
      {buttons.map(({ label, value, activeClass }) => (
        <button
          key={value}
          className={`market-btn${current === value ? ` ${activeClass}` : ''}`}
          onClick={() => onSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
