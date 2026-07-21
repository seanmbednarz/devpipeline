import type { Property } from '../types'
import { STATUS_META, PIPELINE_META } from '../types'
import { formatSf } from '../lib/format'

interface PropertyDetailProps {
  property: Property
  onClose: () => void
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null
  return (
    <div className="border-b border-ecr-charcoal-10 py-2">
      <div className="font-ui text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ecr-gray-mid">
        {label}
      </div>
      <div className="mt-0.5 font-body text-[13px] text-ecr-charcoal">{value}</div>
    </div>
  )
}

export function PropertyDetail({ property: p, onClose }: PropertyDetailProps) {
  const meta = STATUS_META[p.status]
  const photos = p.photos ?? []

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
                className="rounded-sm px-1.5 py-0.5 font-ui text-[8.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ background: meta.color, color: '#fff' }}
              >
                {meta.label}
              </span>
            </div>
            <h2 className="mt-2 font-ui text-[15px] font-extrabold uppercase leading-tight tracking-[0.02em] text-ecr-charcoal">
              {p.name}
            </h2>
            <p className="mt-0.5 font-body text-[12px] italic text-ecr-charcoal-70">{p.address}</p>
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
            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-ecr-charcoal">
              Photos
            </span>
            <button
              disabled
              title="Editing & photo uploads unlock once the backend is connected"
              className="cursor-not-allowed rounded-md border border-dashed border-ecr-charcoal-20 px-2 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.08em] text-ecr-gray-mid"
            >
              + Add photos
            </button>
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${p.name} ${i + 1}`}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed border-ecr-charcoal-20 bg-ecr-cream-80 text-center">
              <span className="px-4 font-ui text-[11px] text-ecr-gray-mid">
                No photos yet
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-4 pb-6">
          <Field label={`${PIPELINE_META[p.pipeline].sizeLabel}`} value={formatSf(p.sf)} />
          <Field
            label="Available Space"
            value={p.availableSf ? formatSf(p.availableSf) : null}
          />
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
          <Field label="Parking Ratio" value={p.parkingRatio != null ? `${p.parkingRatio} / 1,000 SF` : null} />
        </div>
      </div>
    </div>
  )
}
