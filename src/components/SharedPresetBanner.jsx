import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { parseSharedPreset, clearSharedHash } from '../lib/presetShare'

export default function SharedPresetBanner() {
  const { dispatch } = useApp()
  // Read the shared preset out of the URL hash once, on mount.
  const [shared, setShared] = useState(() => parseSharedPreset())

  if (!shared) return null

  function importIt() {
    dispatch({ type: 'ADD_PRESET', name: shared.name, snapshot: shared.snapshot })
    clearSharedHash()
    setShared(null)
  }

  function dismiss() {
    clearSharedHash()
    setShared(null)
  }

  return (
    <div className="shared-banner">
      <span className="shared-text">
        📥 Someone shared the preset “<strong>{shared.name}</strong>”. Add it to your presets?
      </span>
      <div className="shared-actions">
        <button className="shared-import" onClick={importIt}>Import preset</button>
        <button className="shared-dismiss" onClick={dismiss}>Dismiss</button>
      </div>
    </div>
  )
}
