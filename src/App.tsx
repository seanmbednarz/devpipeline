import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PIPELINE_DATA } from './data/pipelines'
import type { Pipeline, Status } from './types'
import { STATUS_ORDER, STATUS_META, PIPELINE_META } from './types'
import { Header } from './components/Header'
import { Filters } from './components/Filters'
import { Totals } from './components/Totals'
import { PropertyList } from './components/PropertyList'
import { PropertyDetail } from './components/PropertyDetail'
import { PrintReport } from './components/PrintReport'
import { MapPane } from './components/MapPane'
import { AddProperty } from './components/AddProperty'
import { useOverrides, type OverridePatch } from './hooks/useOverrides'
import { useAuth } from './hooks/useAuth'

const LARGE_SF = 25_000
const EDITION: Record<Pipeline, string> = { office: 'Q3 2026', industrial: 'Q3 2026' }

export default function App() {
  const [pipeline, setPipeline] = useState<Pipeline>('office')
  const [active, setActive] = useState<Set<Status>>(new Set(STATUS_ORDER))
  const [query, setQuery] = useState('')
  const [largeOnly, setLargeOnly] = useState(false)
  const [submarket, setSubmarket] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [printing, setPrinting] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newLoc, setNewLoc] = useState<{ lat: number; lng: number } | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const { isEditor } = useAuth()
  const {
    apply,
    additions,
    hiddenIds,
    save: saveOverride,
    remove: removeProperty,
    restore,
    addProperty,
  } = useOverrides()

  // Merge static data + editor additions, drop hidden, apply field edits, then
  // number 1…N by status + size so add/remove auto-renumbers.
  const all = useMemo(() => {
    const staticProps = PIPELINE_DATA[pipeline].filter((p) => !hiddenIds.has(p.id))
    const added = additions.filter((p) => p.pipeline === pipeline)
    const list = [...staticProps, ...added].map(apply)
    const order: Record<Status, number> = { uc: 0, proposed: 1, delivered: 2 }
    const sorted = [...list].sort((a, b) => order[a.status] - order[b.status] || b.sf - a.sf)
    const numById = new Map(sorted.map((p, i) => [p.id, i + 1]))
    return list.map((p) => ({ ...p, num: numById.get(p.id)! }))
  }, [pipeline, apply, additions, hiddenIds])

  // Hidden (soft-deleted) static properties, for the editor's "Removed" list.
  const removed = useMemo(
    () => PIPELINE_DATA[pipeline].filter((p) => hiddenIds.has(p.id)),
    [pipeline, hiddenIds],
  )

  // Reset transient state when switching pipelines.
  useEffect(() => {
    setSelectedId(null)
    setHoveredId(null)
    setQuery('')
    setActive(new Set(STATUS_ORDER))
    setSubmarket('all')
    setAdding(false)
    setNewLoc(null)
  }, [pipeline])

  const q = query.trim().toLowerCase()

  // Submarket options for the active pipeline (with counts). Empty for Office.
  const submarkets = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of all) {
      const s = p.submarket?.trim()
      if (s) m.set(s, (m.get(s) ?? 0) + 1)
    }
    return [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [all])

  const base = useMemo(
    () =>
      all.filter((p) => {
        if (largeOnly && p.sf < LARGE_SF) return false
        if (submarket !== 'all' && (p.submarket ?? '') !== submarket) return false
        if (!q) return true
        return (
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.developer?.toLowerCase().includes(q) ?? false) ||
          (p.submarket?.toLowerCase().includes(q) ?? false)
        )
      }),
    [all, q, largeOnly, submarket],
  )

  const counts = useMemo(() => {
    const c = { uc: 0, proposed: 0, delivered: 0 } as Record<Status, number>
    for (const p of base) c[p.status]++
    return c
  }, [base])

  const visible = useMemo(() => base.filter((p) => active.has(p.status)), [base, active])

  const selected = useMemo(() => all.find((p) => p.id === selectedId) ?? null, [all, selectedId])

  // Arrow-key navigation: once a property is open, ← / → step through the
  // visible (filtered, ordered) list. Wraps around at the ends.
  useEffect(() => {
    if (!selectedId || adding || printing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const idx = visible.findIndex((p) => p.id === selectedId)
      if (idx === -1) return
      e.preventDefault()
      const delta = e.key === 'ArrowRight' ? 1 : -1
      const next = visible[(idx + delta + visible.length) % visible.length]
      if (next) setSelectedId(next.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, visible, adding, printing])

  const toggleStatus = (s: Status) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  const showAside = selected != null || adding || mobileView === 'list'

  const startAdd = () => {
    setSelectedId(null)
    setNewLoc(null)
    setAdding(true)
  }
  const cancelAdd = () => {
    setAdding(false)
    setNewLoc(null)
  }
  const handleAddSave = async (fields: OverridePatch) => {
    const { id, error } = await addProperty(pipeline, fields)
    if (!error) {
      setAdding(false)
      setNewLoc(null)
      setSelectedId(id)
    }
    return { error }
  }

  // Human summary of the active filters for the PDF header.
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (active.size < STATUS_ORDER.length) {
      parts.push(STATUS_ORDER.filter((s) => active.has(s)).map((s) => STATUS_META[s].label).join(', '))
    }
    if (submarket !== 'all') parts.push(submarket)
    if (q) parts.push(`“${query.trim()}”`)
    if (largeOnly) parts.push('Above 25,000 SF')
    return parts.length ? parts.join('  ·  ') : 'All projects'
  }, [active, submarket, q, query, largeOnly])

  // Render the print report, wait for its thumbnails to load, then open the print dialog.
  const handlePrint = useCallback(async () => {
    setPrinting(true)
    await new Promise((r) => setTimeout(r, 60))
    const imgs = Array.from(reportRef.current?.querySelectorAll('img') ?? [])
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.onload = () => res()
              img.onerror = () => res()
            }),
      ),
    )
    window.addEventListener('afterprint', () => setPrinting(false), { once: true })
    window.print()
  }, [])

  return (
    <>
    <div className="app-shell flex h-full flex-col bg-ecr-cream">
      <Header pipeline={pipeline} onPipeline={setPipeline} onPrint={handlePrint} />

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
            adding={adding}
            newLocation={newLoc}
            onMapClick={(lng, lat) => setNewLoc({ lat, lng })}
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
              submarkets={submarkets}
              submarket={submarket}
              onSubmarket={setSubmarket}
            />
            {isEditor && (
              <button
                onClick={startAdd}
                className="w-full rounded-md border border-dashed border-ecr-red-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-ecr-red transition-colors hover:bg-ecr-red hover:text-white"
              >
                + Add property
              </button>
            )}
          </div>
          <div className="ecr-scroll min-h-0 flex-1 overflow-y-auto">
            <PropertyList
              properties={visible}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
            />
            {isEditor && removed.length > 0 && (
              <div className="border-t border-ecr-charcoal-20 px-4 py-3">
                <div className="mb-1.5 font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-ecr-gray-mid">
                  Removed ({removed.length})
                </div>
                {removed.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1">
                    <span className="min-w-0 truncate font-ui text-[11px] text-ecr-charcoal-70">
                      {p.name}
                    </span>
                    <button
                      onClick={() => restore(p.id)}
                      className="ml-2 flex-none font-ui text-[10px] font-semibold uppercase tracking-[0.06em] text-ecr-red hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-ecr-charcoal-20 px-4 py-2 font-ui text-[9px] uppercase tracking-[0.1em] text-ecr-gray-mid">
            {EDITION[pipeline]} · {all.length} projects · 114 W 7th St, Austin
          </div>

          {/* Detail overlay (sidebar width) */}
          {selected && !adding && (
            <div className="absolute inset-0 z-30">
              <PropertyDetail
                property={selected}
                onClose={() => setSelectedId(null)}
                onSaveOverride={saveOverride}
                onRemove={removeProperty}
              />
            </div>
          )}

          {/* Add-property overlay */}
          {adding && (
            <div className="absolute inset-0 z-30">
              <AddProperty
                pipeline={pipeline}
                location={newLoc}
                onLocationChange={setNewLoc}
                onSave={handleAddSave}
                onCancel={cancelAdd}
              />
            </div>
          )}
        </aside>
      </div>
    </div>

    {printing && (
      <PrintReport
        ref={reportRef}
        properties={visible}
        pipelineLabel={PIPELINE_META[pipeline].label}
        edition={EDITION[pipeline]}
        subtitle={filterSummary}
        date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      />
    )}
    </>
  )
}
