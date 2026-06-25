// Share presets between users via a URL hash — no backend required.
// A shared link looks like:  https://app/#preset=<lz-compressed(JSON({name, snapshot}))>
import LZString from 'lz-string'
import { DEFAULT, PANEL_KEYS } from '../context/AppContext'

export function encodePreset(obj) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(obj))
}

export function decodePreset(s) {
  // Try lz-string first (new format)
  try {
    const d = LZString.decompressFromEncodedURIComponent(s)
    if (d) return JSON.parse(d)
  } catch {}
  // Legacy base64url fallback (links shared before lz-string was added)
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return JSON.parse(new TextDecoder().decode(bytes))
}

// Coerce an untrusted snapshot (decoded from a link) into a safe, complete shape.
export function normalizeSnapshot(snapshot) {
  const base = JSON.parse(JSON.stringify(DEFAULT))
  const merged = { ...base, ...(snapshot && typeof snapshot === 'object' ? snapshot : {}) }
  delete merged.presets // snapshots never carry a nested preset library
  if (!Array.isArray(merged.sessionChecklist)) merged.sessionChecklist = base.sessionChecklist
  if (!Array.isArray(merged.tradeChecklist)) merged.tradeChecklist = base.tradeChecklist
  if (!Array.isArray(merged.rules)) merged.rules = base.rules
  const order = Array.isArray(merged.panelOrder) ? merged.panelOrder.filter(k => PANEL_KEYS.includes(k)) : []
  for (const k of PANEL_KEYS) if (!order.includes(k)) order.push(k)
  merged.panelOrder = order
  return merged
}

export function buildShareLink(preset) {
  const payload = encodePreset({ name: preset.name, snapshot: preset.snapshot })
  return `${location.origin}${location.pathname}#preset=${payload}`
}

// Read a shared preset out of the current URL hash, or null if absent/invalid.
export function parseSharedPreset() {
  const m = location.hash.match(/[#&]preset=([^&]+)/)
  if (!m) return null
  try {
    const decoded = decodePreset(m[1])
    if (!decoded || typeof decoded.name !== 'string' || typeof decoded.snapshot !== 'object') return null
    return { name: decoded.name.trim().slice(0, 80) || 'Shared preset', snapshot: normalizeSnapshot(decoded.snapshot) }
  } catch {
    return null
  }
}

export function clearSharedHash() {
  history.replaceState(null, '', location.pathname + location.search)
}
