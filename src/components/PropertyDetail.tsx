import { useRef, useState } from 'react'
import type { Property, Status } from '../types'
import { STATUS_META, STATUS_ORDER, PIPELINE_META } from '../types'
import { formatSf } from '../lib/format'
import { useAuth } from '../hooks/useAuth'
import { usePropertyPhotos } from '../hooks/usePropertyPhotos'
import type { OverridePatch } from '../hooks/useOverrides'
import { PHOTO_MANIFEST } from '../data/photoManifest'

interface PropertyDetailProps {
  property: Property
  onClose: () => void
  onSaveOverride: (id: string, patch: OverridePatch) => Promise<{ error: string | null }>
  onRemove: (id: string) => Promise<{ error: string | null }>
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null
  return (
    <div className="border-b border-ecr-charcoal-10 py-2.5">
      <div className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
        {label}
      </div>
      <div className="mt-1 font-body text-[16px] leading-snug text-ecr-charcoal">{value}</div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded border border-ecr-charcoal-20 px-2 py-1.5 font-body text-[15px] focus:border-ecr-charcoal-70 focus:outline-none"
      />
    </label>
  )
}

const num = (s: string): number | null => {
  const n = Number(s.replace(/,/g, ''))
  return s.trim() === '' || Number.isNaN(n) ? null : n
}

export function PropertyDetail({ property: p, onClose, onSaveOverride, onRemove }: PropertyDetailProps) {
  const meta = STATUS_META[p.status]
  const { isEditor } = useAuth()
  const { photos, uploading, upload, remove, error: photoError } = usePropertyPhotos(p.id)
  const repoPhotos = PHOTO_MANIFEST[p.id] ?? []
  const fileRef = useRef<HTMLInputElement>(null)
  const isAdded = p.id.startsWith('custom-')

  const handleRemove = async () => {
    const label = isAdded ? 'Delete this added property?' : 'Remove this property from the pipeline?'
    if (!window.confirm(label)) return
    await onRemove(p.id)
    onClose()
  }

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const val = (k: keyof Property) => (k in form ? form[k as string] : (p[k] ?? '')?.toString() ?? '')

  const startEdit = () => {
    setForm({})
    setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    const patch: OverridePatch = {
      name: val('name'),
      address: val('address'),
      status: (form.status as Status) ?? p.status,
      sf: num(val('sf')) ?? p.sf,
      lat: num(val('lat')),
      lng: num(val('lng')),
      availableSf: num(val('availableSf')),
      buildingClass: val('buildingClass') || null,
      buildings: num(val('buildings')),
      developer: val('developer') || null,
      leasingCompany: val('leasingCompany') || null,
      leasingContact: val('leasingContact') || null,
      submarket: val('submarket') || null,
      constructionBegin: val('constructionBegin') || null,
    }
    const { error } = await onSaveOverride(p.id, patch)
    setSaving(false)
    if (!error) setEditing(false)
  }

  return (
    <div className="flex h-full flex-col bg-ecr-cream">
      {/* Header */}
      <div className="flex-none border-b border-ecr-charcoal-20 bg-white">
        <div className="flex items-start justify-between gap-2 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 flex-none items-center justify-center rounded-full font-ui text-[10px] font-bold"
                style={{ background: meta.color, color: meta.onColor }}
              >
                {p.num}
              </span>
              <span
                className="rounded-sm px-1.5 py-0.5 font-ui text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ background: meta.color, color: '#fff' }}
              >
                {meta.label}
              </span>
            </div>
            <h2 className="mt-2 font-ui text-[18px] font-extrabold uppercase leading-tight tracking-[0.02em] text-ecr-charcoal">
              {p.name}
            </h2>
            <p className="mt-1 font-body text-[14px] italic text-ecr-charcoal-70">{p.address}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-none rounded-full p-1 text-ecr-gray-mid transition-colors hover:bg-ecr-charcoal-10 hover:text-ecr-charcoal"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ecr-scroll min-h-0 flex-1 overflow-y-auto">
        {/* Photos */}
        <div className="border-b border-ecr-charcoal-20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-ui text-[11px] font-bold uppercase tracking-[0.14em] text-ecr-charcoal">
              Photos
            </span>
            {isEditor && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    if (e.target.files) upload(Array.from(e.target.files))
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md border border-ecr-charcoal px-2 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.08em] text-ecr-charcoal transition-colors hover:bg-ecr-charcoal hover:text-white disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : '+ Add photos'}
                </button>
              </>
            )}
          </div>
          {photoError && <p className="mb-2 font-ui text-[11px] text-ecr-red">{photoError}</p>}
          {repoPhotos.length + photos.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {/* Repo photos (static, managed in the repo) */}
              {repoPhotos.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt={p.name}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                />
              ))}
              {/* Uploaded photos (Supabase; removable by editors) */}
              {photos.map((photo) => (
                <div key={photo.id} className="group relative">
                  <img
                    src={photo.url}
                    alt={p.name}
                    className="aspect-[4/3] w-full rounded-md object-cover"
                  />
                  {isEditor && (
                    <button
                      onClick={() => remove(photo.id)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-full bg-ecr-charcoal/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed border-ecr-charcoal-20 bg-ecr-cream-80 text-center">
              <span className="px-4 font-ui text-[11px] text-ecr-gray-mid">
                {isEditor ? 'No photos yet — use “Add photos” above' : 'No photos yet'}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-4 pb-6 pt-3">
          {editing ? (
            <div className="space-y-2">
              <Input label="Name" value={val('name')} onChange={set('name')} />
              <Input label="Address" value={val('address')} onChange={set('address')} />
              <label className="block">
                <span className="font-ui text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
                  Status
                </span>
                <select
                  value={val('status') || p.status}
                  onChange={(e) => set('status')(e.target.value)}
                  className="mt-0.5 w-full rounded border border-ecr-charcoal-20 px-2 py-1 font-body text-[13px] focus:border-ecr-charcoal-70 focus:outline-none"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input label={PIPELINE_META[p.pipeline].sizeLabel} value={val('sf')} onChange={set('sf')} />
                <Input label="Available SF" value={val('availableSf')} onChange={set('availableSf')} />
                <Input label="Building Class" value={val('buildingClass')} onChange={set('buildingClass')} />
                <Input label="Buildings" value={val('buildings')} onChange={set('buildings')} />
              </div>
              <Input label="Developer" value={val('developer')} onChange={set('developer')} />
              <Input label="Leasing Company" value={val('leasingCompany')} onChange={set('leasingCompany')} />
              <Input label="Leasing Contact" value={val('leasingContact')} onChange={set('leasingContact')} />
              <Input label="Submarket" value={val('submarket')} onChange={set('submarket')} />
              <Input label="Construction Begins" value={val('constructionBegin')} onChange={set('constructionBegin')} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Latitude" value={val('lat')} onChange={set('lat')} />
                <Input label="Longitude" value={val('lng')} onChange={set('lng')} />
              </div>
              <p className="font-ui text-[9px] text-ecr-gray-mid">
                Tip: adjust latitude / longitude to fix an approximate map pin.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-md border border-ecr-charcoal-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-ecr-charcoal-70"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 rounded-md bg-ecr-charcoal py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {isEditor && (
                <button
                  onClick={startEdit}
                  className="mb-2 w-full rounded-md border border-dashed border-ecr-charcoal-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-ecr-charcoal-70 transition-colors hover:border-ecr-charcoal-70 hover:text-ecr-charcoal"
                >
                  Edit details
                </button>
              )}
              <Field label={PIPELINE_META[p.pipeline].sizeLabel} value={formatSf(p.sf)} />
              <Field
                label="Percent Leased"
                value={p.percentLeased != null ? `${p.percentLeased}%` : null}
              />
              <Field label="Available Space" value={p.availableSf ? formatSf(p.availableSf) : null} />
              <Field label="Building Class" value={p.buildingClass ? `Class ${p.buildingClass}` : null} />
              <Field label="Buildings" value={p.buildings ?? null} />
              <Field label="Developer" value={p.developer} />
              <Field label="Leasing Company" value={p.leasingCompany} />
              <Field label="Leasing Contact" value={p.leasingContact} />
              <Field label="Construction Begins" value={p.constructionBegin} />
              <Field label="Submarket" value={p.submarket} />
              <Field
                label="City / County"
                value={[p.city, p.county && `${p.county} County`].filter(Boolean).join(' · ') || null}
              />
              <Field
                label="Parking Ratio"
                value={p.parkingRatio != null ? `${p.parkingRatio} / 1,000 SF` : null}
              />
              {isEditor && (
                <button
                  onClick={handleRemove}
                  className="mt-4 w-full rounded-md border border-ecr-red-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-ecr-red transition-colors hover:bg-ecr-red hover:text-white"
                >
                  {isAdded ? 'Delete property' : 'Remove from pipeline'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
