import type { Status } from '../types'
import { STATUS_META, STATUS_ORDER } from '../types'

interface FiltersProps {
  active: Set<Status>
  onToggleStatus: (s: Status) => void
  query: string
  onQuery: (q: string) => void
  largeOnly: boolean
  onLargeOnly: (v: boolean) => void
  counts: Record<Status, number>
}

export function Filters({
  active,
  onToggleStatus,
  query,
  onQuery,
  largeOnly,
  onLargeOnly,
  counts,
}: FiltersProps) {
  return (
    <div className="space-y-2.5">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ecr-gray-mid"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search name or address…"
          className="w-full rounded-md border border-ecr-charcoal-20 bg-white py-2 pl-8 pr-3 font-ui text-[12px] text-ecr-charcoal placeholder:text-ecr-gray-mid focus:border-ecr-charcoal-70 focus:outline-none"
        />
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_ORDER.map((s) => {
          const meta = STATUS_META[s]
          const on = active.has(s)
          return (
            <button
              key={s}
              onClick={() => onToggleStatus(s)}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={{
                borderColor: on ? meta.color : '#d4d6d6',
                background: on ? meta.color : 'transparent',
                color: on ? '#fff' : '#6b7170',
              }}
              aria-pressed={on}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: on ? '#fff' : meta.color }}
              />
              {meta.label}
              <span className={on ? 'text-white/80' : 'text-ecr-gray-mid'}>{counts[s]}</span>
            </button>
          )
        })}
      </div>

      {/* SF threshold */}
      <label className="flex cursor-pointer items-center gap-2 font-ui text-[11px] font-medium text-ecr-charcoal-70">
        <button
          type="button"
          role="switch"
          aria-checked={largeOnly}
          onClick={() => onLargeOnly(!largeOnly)}
          className="relative h-4 w-7 rounded-full transition-colors"
          style={{ background: largeOnly ? '#3F4443' : '#BEC6C4' }}
        >
          <span
            className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all"
            style={{ left: largeOnly ? 14 : 2 }}
          />
        </button>
        Above 25,000 SF only
      </label>
    </div>
  )
}
