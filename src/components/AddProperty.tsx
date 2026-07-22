import { useState } from 'react'
import type { Pipeline, Status } from '../types'
import { STATUS_META, STATUS_ORDER, PIPELINE_META } from '../types'
import type { OverridePatch } from '../hooks/useOverrides'

interface AddPropertyProps {
  pipeline: Pipeline
  location: { lat: number; lng: number } | null
  onLocationChange: (loc: { lat: number; lng: number } | null) => void
  onSave: (fields: OverridePatch) => Promise<{ error: string | null }>
  onCancel: () => void
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded border border-ecr-charcoal-20 px-2 py-1.5 font-body text-[15px] focus:border-ecr-charcoal-70 focus:outline-none"
      />
    </label>
  )
}

const num = (s: string): number | null => {
  const n = Number(s.replace(/,/g, ''))
  return s.trim() === '' || Number.isNaN(n) ? null : n
}

export function AddProperty({ pipeline, location, onLocationChange, onSave, onCancel }: AddPropertyProps) {
  const [f, setF] = useState<Record<string, string>>({ status: 'proposed' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }))

  const canSave = f.name?.trim() && location

  const save = async () => {
    if (!canSave || !location) return
    setSaving(true)
    setError(null)
    const patch: OverridePatch = {
      name: f.name.trim(),
      address: f.address?.trim() || '',
      status: (f.status as Status) ?? 'proposed',
      sf: num(f.sf ?? '') ?? 0,
      lat: location.lat,
      lng: location.lng,
      availableSf: num(f.availableSf ?? ''),
      buildingClass: f.buildingClass?.trim() || null,
      developer: f.developer?.trim() || null,
      submarket: f.submarket?.trim() || null,
      city: f.city?.trim() || null,
    }
    const { error } = await onSave(patch)
    setSaving(false)
    if (error) setError(error)
  }

  return (
    <div className="flex h-full flex-col bg-ecr-cream">
      <div className="flex-none border-b border-ecr-charcoal-20 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-[15px] font-extrabold uppercase tracking-[0.02em] text-ecr-charcoal">
            Add {PIPELINE_META[pipeline].label} Property
          </h2>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="rounded-full p-1 text-ecr-gray-mid transition-colors hover:bg-ecr-charcoal-10 hover:text-ecr-charcoal"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p
          className="mt-1 rounded px-2 py-1 font-ui text-[11px] font-medium"
          style={{
            background: location ? '#eaf6ea' : '#fdeaec',
            color: location ? '#2b6b2b' : '#b02a37',
          }}
        >
          {location
            ? `📍 Pin placed — ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : '📍 Click the map to place the pin'}
        </p>
      </div>

      <div className="ecr-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        <Input label="Name *" value={f.name ?? ''} onChange={set('name')} placeholder="Property name" />
        <Input label="Address" value={f.address ?? ''} onChange={set('address')} />
        <label className="block">
          <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
            Status
          </span>
          <select
            value={f.status ?? 'proposed'}
            onChange={(e) => set('status')(e.target.value)}
            className="mt-0.5 w-full rounded border border-ecr-charcoal-20 px-2 py-1.5 font-body text-[15px] focus:border-ecr-charcoal-70 focus:outline-none"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input label={PIPELINE_META[pipeline].sizeLabel} value={f.sf ?? ''} onChange={set('sf')} />
          <Input label="Available SF" value={f.availableSf ?? ''} onChange={set('availableSf')} />
          <Input label="Building Class" value={f.buildingClass ?? ''} onChange={set('buildingClass')} />
          <Input label="City" value={f.city ?? ''} onChange={set('city')} />
        </div>
        <Input label="Developer" value={f.developer ?? ''} onChange={set('developer')} />
        <Input label="Submarket" value={f.submarket ?? ''} onChange={set('submarket')} />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Latitude"
            value={location ? String(location.lat) : ''}
            onChange={(v) => {
              const lat = num(v)
              if (lat != null) onLocationChange({ lat, lng: location?.lng ?? -97.74 })
            }}
          />
          <Input
            label="Longitude"
            value={location ? String(location.lng) : ''}
            onChange={(v) => {
              const lng = num(v)
              if (lng != null) onLocationChange({ lat: location?.lat ?? 30.27, lng })
            }}
          />
        </div>
        {error && <p className="font-ui text-[11px] text-ecr-red">{error}</p>}
      </div>

      <div className="flex-none border-t border-ecr-charcoal-20 bg-white p-3">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-ecr-charcoal-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-ecr-charcoal-70"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave || saving}
            className="flex-1 rounded-md bg-ecr-red py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add Property'}
          </button>
        </div>
      </div>
    </div>
  )
}
