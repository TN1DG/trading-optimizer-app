import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { buildShareLink } from '../lib/presetShare'

export default function PresetMenu() {
  const { presets = [], dispatch } = useApp()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function saveCurrent() {
    const name = window.prompt('Save current view as a preset:')?.trim()
    if (name) dispatch({ type: 'SAVE_PRESET', name })
  }

  function load(id) {
    dispatch({ type: 'LOAD_PRESET', id })
    setOpen(false)
  }

  function del(e, id) {
    e.stopPropagation()
    dispatch({ type: 'DELETE_PRESET', id })
  }

  async function share(e, preset) {
    e.stopPropagation()
    const link = buildShareLink(preset)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — let the user copy manually
      window.prompt('Copy this share link:', link)
    }
  }

  return (
    <div className="preset-menu" ref={ref}>
      <button
        className={'preset-toggle' + (open ? ' open' : '')}
        onClick={() => setOpen(o => !o)}
        title="Saved views for this page"
      >
        Presets ▾
      </button>
      {open && (
        <div className="preset-pop">
          {copied && <div className="preset-copied">✓ Share link copied</div>}
          {presets.length === 0 && <div className="preset-empty">No presets saved yet</div>}
          {presets.map(p => (
            <div key={p.id} className="preset-row" onClick={() => load(p.id)} title="Load this preset">
              <span className="preset-name">{p.name}</span>
              <button className="preset-share" title="Copy share link" onClick={e => share(e, p)}>🔗</button>
              <button className="preset-del" title="Delete preset" onClick={e => del(e, p.id)}>×</button>
            </div>
          ))}
          <button className="preset-save" onClick={saveCurrent}>＋ Save current view…</button>
        </div>
      )}
    </div>
  )
}
