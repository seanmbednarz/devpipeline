import { useMemo, useState } from 'react'
import { PROPERTIES } from './data/properties'
import type { Status } from './types'
import { STATUS_ORDER } from './types'
import { Header } from './components/Header'
import { Filters } from './components/Filters'
import { Totals } from './components/Totals'
import { PropertyList } from './components/PropertyList'
import { MapPane } from './components/MapPane'

const LARGE_SF = 25_000

export default function App() {
  const [active, setActive] = useState<Set<Status>>(new Set(STATUS_ORDER))
  const [query, setQuery] = useState('')
  const [largeOnly, setLargeOnly] = useState(false)
  const [selectedNum, setSelectedNum] = useState<number | null>(null)
  const [hoveredNum, setHoveredNum] = useState<number | null>(null)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')

  const q = query.trim().toLowerCase()

  // Base = query + SF threshold (drives per-status chip counts).
  const base = useMemo(
    () =>
      PROPERTIES.filter((p) => {
        if (largeOnly && p.sf < LARGE_SF) return false
        if (!q) return true
        return (
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          String(p.num) === q
        )
      }),
    [q, largeOnly],
  )

  const counts = useMemo(() => {
    const c = { uc: 0, proposed: 0, delivered: 0 } as Record<Status, number>
    for (const p of base) c[p.status]++
    return c
  }, [base])

  const visible = useMemo(() => base.filter((p) => active.has(p.status)), [base, active])

  const toggleStatus = (s: Status) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col bg-ecr-cream">
      <Header />

      {/* Mobile view toggle */}
      <div className="flex gap-1 border-b border-ecr-charcoal-20 bg-ecr-cream-80 p-1.5 lg:hidden">
        {(['map', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className="flex-1 rounded font-ui text-[11px] font-semibold uppercase tracking-[0.1em] py-1.5 transition-colors"
            style={{
              background: mobileView === v ? '#3F4443' : 'transparent',
              color: mobileView === v ? '#fff' : '#6b7170',
            }}
          >
            {v === 'map' ? 'Map' : `List (${visible.length})`}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Map */}
        <main
          className={`min-w-0 flex-1 ${mobileView === 'map' ? 'block' : 'hidden'} lg:block`}
        >
          <MapPane
            properties={visible}
            selectedNum={selectedNum}
            hoveredNum={hoveredNum}
            onSelect={setSelectedNum}
            onHover={setHoveredNum}
          />
        </main>

        {/* Sidebar */}
        <aside
          className={`w-full flex-none flex-col border-l border-ecr-charcoal-20 bg-ecr-cream lg:flex lg:w-[400px] xl:w-[440px] ${
            mobileView === 'list' ? 'flex' : 'hidden'
          }`}
        >
          <div className="space-y-3 border-b border-ecr-charcoal-20 p-4">
            <Totals properties={visible} />
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
              selectedNum={selectedNum}
              hoveredNum={hoveredNum}
              onSelect={setSelectedNum}
              onHover={setHoveredNum}
            />
          </div>
          <div className="border-t border-ecr-charcoal-20 px-4 py-2 font-ui text-[9px] uppercase tracking-[0.1em] text-ecr-gray-mid">
            Q4 2025 · {PROPERTIES.length} projects · 114 W 7th St, Austin
          </div>
        </aside>
      </div>
    </div>
  )
}
