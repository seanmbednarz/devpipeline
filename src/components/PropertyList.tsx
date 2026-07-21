import { useEffect, useRef } from 'react'
import type { Property } from '../types'
import { STATUS_META, STATUS_ORDER } from '../types'
import { formatSf } from '../lib/format'

interface PropertyListProps {
  properties: Property[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

export function PropertyList({
  properties,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: PropertyListProps) {
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Scroll the selected row into view when selection comes from the map.
  useEffect(() => {
    if (selectedId != null) {
      rowRefs.current[selectedId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedId])

  const groups = STATUS_ORDER.map((s) => ({
    status: s,
    items: properties
      .filter((p) => p.status === s)
      .sort((a, b) => b.sf - a.sf),
  })).filter((g) => g.items.length > 0)

  if (properties.length === 0) {
    return (
      <div className="px-4 py-10 text-center font-ui text-[12px] text-ecr-gray-mid">
        No projects match your filters.
      </div>
    )
  }

  return (
    <div>
      {groups.map((g) => {
        const meta = STATUS_META[g.status]
        return (
          <div key={g.status} className="mb-1">
            <div className="sticky top-0 z-10 flex items-center gap-2 bg-ecr-cream px-4 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
              <span className="font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-ecr-charcoal">
                {meta.label}
              </span>
              <span className="font-ui text-[10px] font-medium text-ecr-gray-mid">
                {g.items.length}
              </span>
            </div>
            <ul>
              {g.items.map((p) => {
                const isSelected = p.id === selectedId
                const isHovered = p.id === hoveredId
                const noGeo = p.lat == null || p.lng == null
                return (
                  <li key={p.id}>
                    <button
                      ref={(el) => {
                        rowRefs.current[p.id] = el
                      }}
                      onClick={() => onSelect(isSelected ? null : p.id)}
                      onMouseEnter={() => onHover(p.id)}
                      onMouseLeave={() => onHover(null)}
                      className="flex w-full items-start gap-2.5 px-4 py-2 text-left transition-colors"
                      style={{
                        background: isSelected
                          ? '#eaebeb'
                          : isHovered
                            ? '#f5f2ec'
                            : 'transparent',
                        borderLeft: `3px solid ${isSelected ? meta.color : 'transparent'}`,
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full font-ui text-[10px] font-bold"
                        style={{ background: meta.color, color: meta.onColor }}
                      >
                        {p.num}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-ui text-[11.5px] font-bold uppercase leading-tight tracking-[0.02em] text-ecr-charcoal">
                          {p.name}
                        </span>
                        <span className="mt-0.5 block truncate font-body text-[11px] italic text-ecr-charcoal-70">
                          {p.address}
                        </span>
                      </span>
                      <span className="mt-0.5 flex-none text-right">
                        <span className="block font-ui text-[11px] font-semibold text-ecr-charcoal">
                          {formatSf(p.sf)}
                        </span>
                        {noGeo && (
                          <span className="font-ui text-[8px] uppercase tracking-wide text-ecr-gray-mid">
                            not mapped
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
