import { useCallback, useEffect, useRef } from 'react'
import Map, {
  Marker,
  Popup,
  NavigationControl,
  AttributionControl,
  type MapRef,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Property } from '../types'
import { STATUS_META } from '../types'
import { formatSf } from '../lib/format'
import { MAP_STYLE, ATTRIBUTION, transformRequest } from '../lib/mapStyle'

interface MapPaneProps {
  properties: Property[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

// Greater Austin default view — used before the first fit.
const DEFAULT_VIEW = { longitude: -97.74, latitude: 30.31, zoom: 9.4 }
const FIT_PADDING = { top: 70, bottom: 70, left: 70, right: 70 }

function fit(map: MapRef, props: Property[]) {
  const geo = props.filter((p) => p.lat != null && p.lng != null)
  if (geo.length === 0) return
  if (geo.length === 1) {
    map.flyTo({ center: [geo[0].lng!, geo[0].lat!], zoom: 13, duration: 700 })
    return
  }
  const lngs = geo.map((p) => p.lng!)
  const lats = geo.map((p) => p.lat!)
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: FIT_PADDING, duration: 700, maxZoom: 13 },
  )
}

export function MapPane({ properties, selectedId, hoveredId, onSelect, onHover }: MapPaneProps) {
  const mapRef = useRef<MapRef>(null)
  const loaded = useRef(false)
  const geo = properties.filter((p) => p.lat != null && p.lng != null)
  const fitKey = geo.map((p) => p.id).join(',')

  // Re-fit whenever the visible set changes (filters/search/pipeline).
  useEffect(() => {
    if (loaded.current && mapRef.current) fit(mapRef.current, properties)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey])

  // When a property is selected from the list, ease the map to it.
  useEffect(() => {
    if (!loaded.current || !mapRef.current || selectedId == null) return
    const p = geo.find((g) => g.id === selectedId)
    if (p) mapRef.current.easeTo({ center: [p.lng!, p.lat!], duration: 600, zoom: Math.max(mapRef.current.getZoom(), 12) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const onLoad = useCallback(() => {
    loaded.current = true
    if (mapRef.current) fit(mapRef.current, properties)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey])

  const selected = geo.find((p) => p.id === selectedId) ?? null

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={MAP_STYLE}
        transformRequest={transformRequest}
        attributionControl={false}
        onLoad={onLoad}
        onClick={() => onSelect(null)}
        style={{ position: 'absolute', inset: 0 }}
      >
        <NavigationControl position="top-left" showCompass={false} />
        <AttributionControl compact customAttribution={ATTRIBUTION} />

        {geo.map((p) => {
          const meta = STATUS_META[p.status]
          const isSelected = p.id === selectedId
          const isHovered = p.id === hoveredId
          const active = isSelected || isHovered
          return (
            <Marker
              key={p.id}
              longitude={p.lng!}
              latitude={p.lat!}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                onSelect(isSelected ? null : p.id)
              }}
            >
              <div
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={() => onHover(null)}
                className="flex items-center justify-center rounded-full font-ui font-bold cursor-pointer transition-transform"
                style={{
                  width: active ? 30 : 24,
                  height: active ? 30 : 24,
                  fontSize: active ? 13 : 11,
                  background: meta.color,
                  color: meta.onColor,
                  border: `2px solid ${isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.85)'}`,
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(63,68,67,0.85), 0 2px 6px rgba(0,0,0,0.35)'
                    : '0 1px 4px rgba(0,0,0,0.35)',
                  zIndex: active ? 10 : 1,
                }}
              >
                {p.num}
              </div>
            </Marker>
          )
        })}

        {selected && (
          <Popup
            longitude={selected.lng!}
            latitude={selected.lat!}
            anchor="bottom"
            offset={22}
            closeButton={false}
            closeOnClick={false}
            className="ecr-popup"
          >
            <div className="min-w-[180px] max-w-[240px] p-0.5">
              <div
                className="mb-1 inline-block rounded-sm px-1.5 py-0.5 font-ui text-[9px] font-semibold uppercase tracking-[0.14em]"
                style={{ background: STATUS_META[selected.status].color, color: '#fff' }}
              >
                {STATUS_META[selected.status].label}
              </div>
              <div className="font-ui text-[13px] font-bold uppercase leading-tight tracking-[0.03em] text-ecr-charcoal">
                {selected.name}
              </div>
              <div className="mt-0.5 font-body text-[12px] italic text-ecr-charcoal-70">
                {selected.address}
              </div>
              <div className="mt-1 font-ui text-[12px] font-semibold text-ecr-charcoal">
                {formatSf(selected.sf)}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
