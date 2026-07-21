import { useEffect, useMemo, useState } from 'react'
import { PIPELINE_DATA } from './data/pipelines'
import type { Pipeline, Status } from './types'
import { STATUS_ORDER } from './types'
import { Header } from './components/Header'
import { Filters } from './components/Filters'
import { Totals } from './components/Totals'
import { PropertyList } from './components/PropertyList'
import { PropertyDetail } from './components/PropertyDetail'
import { MapPane } from './components/MapPane'

const LARGE_SF = 25_000
const EDITION: Record<Pipeline, string> = { office: 'Q4 2025', industrial: 'Q3 2026' }

export default function App() {
  const [pipeline, setPipeline] = useState<Pipeline>('office')
  const [active, setActive] = useState<Set<Status>>(new Set(STATUS_ORDER))
  const [query, setQuery] = useState('')
  const [largeOnly, setLargeOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')

  const all = PIPELINE_DATA[pipeline]

  // Reset transient state when switching pipelines.
  useEffect(() => {
    setSelectedId(null)
    setHoveredId(null)
    setQuery('')
    setActive(new Set(STATUS_ORDER))
  }, [pipeline])

  const q = query.trim().toLowerCase()

  const base = useMemo(
    () =>
      all.filter((p) => {
        if (largeOnly && p.sf < LARGE_SF) return false
        if (!q) return true
        return (
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.developer?.toLowerCase().includes(q) ?? false) ||
          (p.submarket?.toLowerCase().includes(q) ?? false)
        )
      }),
    [all, q, largeOnly],
  )

  const counts = useMemo(() => {
    const c = { uc: 0, proposed: 0, delivered: 0 } as Record<Status, number>
    for (const p of base) c[p.status]++
    return c
  }, [base])

  const visible = useMemo(() => base.filter((p) => active.has(p.status)), [base, active])

  const selected = useMemo(() => all.find((p) => p.id === selectedId) ?? null, [all, selectedId])

  const toggleStatus = (s: Status) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  const showAside = selected != null || mobileView === 'list'

  return (
    <div className="flex h-full flex-col bg-ecr-cream">
      <Header pipeline={pipeline} onPipeline={setPipeline} />

      {/* Mobile view toggle */}
      <div className="flex gap-1 border-b border-ecr-charcoal-20 bg-ecr-cream-80 p-1.5 lg:hidden">
        {(['map', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => {
              setMobileView(v)
              if (v === 'map') setSelectedId(null)
            }}
            className="flex-1 rounded py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              background: mobileView === v && !selected ? '#3F4443' : 'transparent',
              color: mobileView === v && !selected ? '#fff' : '#6b7170',
            }}
          >
            {v === 'map' ? 'Map' : `List (${visible.length})`}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Map */}
        <main className={`min-w-0 flex-1 ${!showAside ? 'block' : 'hidden'} lg:block`}>
          <MapPane
            properties={visible}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </main>

        {/* Sidebar */}
        <aside
          className={`relative w-full flex-none flex-col border-l border-ecr-charcoal-20 bg-ecr-cream lg:flex lg:w-[400px] xl:w-[440px] ${
            showAside ? 'flex' : 'hidden'
          }`}
        >
          <div className="space-y-3 border-b border-ecr-charcoal-20 p-4">
            <Totals properties={visible} pipeline={pipeline} />
            <Filters
              active={active}
              onToggleStatus={toggleStatus}
              query={query}
              onQuery={setQuery}
              largeOnly={largeOnly}
              onLargeOnly={setLargeOnly}
              counts={counts}
            />
          </div>
          <div className="ecr-scroll min-h-0 flex-1 overflow-y-auto">
            <PropertyList
              properties={visible}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
            />
          </div>
          <div className="border-t border-ecr-charcoal-20 px-4 py-2 font-ui text-[9px] uppercase tracking-[0.1em] text-ecr-gray-mid">
            {EDITION[pipeline]} · {all.length} projects · 114 W 7th St, Austin
          </div>

          {/* Detail overlay */}
          {selected && (
            <div className="absolute inset-0 z-30">
              <PropertyDetail property={selected} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
