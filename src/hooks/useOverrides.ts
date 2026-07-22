import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Pipeline, Property, Status } from '../types'
import { supabase } from '../lib/supabase'

// Fields an editor can set on an existing property or a newly-added one.
const EDITABLE = [
  'name',
  'address',
  'sf',
  'status',
  'lat',
  'lng',
  'availableSf',
  'buildingClass',
  'buildings',
  'developer',
  'leasingCompany',
  'leasingContact',
  'submarket',
  'constructionBegin',
  'city',
  'zip',
  'county',
] as const
type EditableKey = (typeof EDITABLE)[number]

export type OverridePatch = Partial<Pick<Property, EditableKey>>
type OverrideData = OverridePatch & { added?: boolean; hidden?: boolean; pipeline?: Pipeline }

/**
 * All editor state lives in the property_overrides table (property_id → jsonb):
 *  - field edits on existing properties (merged over the static data)
 *  - `hidden: true` soft-deletes a property (reversible)
 *  - `added: true` rows are brand-new properties (id "custom-…")
 * No extra schema — the existing public-read / authenticated-write RLS covers it.
 */
export function useOverrides() {
  const [rows, setRows] = useState<Record<string, OverrideData>>({})
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase!.from('property_overrides').select('property_id, data')
      if (!cancelled && !error && data) {
        const map: Record<string, OverrideData> = {}
        for (const r of data) map[r.property_id as string] = (r.data as OverrideData) ?? {}
        setRows(map)
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Merge a property with its stored field edits (dropping empty values). */
  const apply = useCallback(
    (p: Property): Property => {
      const d = rows[p.id]
      if (!d) return p
      const clean: Record<string, unknown> = {}
      for (const k of EDITABLE) {
        const v = (d as Record<string, unknown>)[k]
        if (v !== undefined && v !== null && v !== '') clean[k] = v
      }
      return { ...p, ...clean }
    },
    [rows],
  )

  /** Editor-added properties, as full Property objects (num is assigned later in App). */
  const additions = useMemo<Property[]>(
    () =>
      Object.entries(rows)
        .filter(([, d]) => d.added && !d.hidden)
        .map(([id, d]) => ({
          id,
          pipeline: (d.pipeline ?? 'office') as Pipeline,
          num: 0,
          name: d.name ?? 'New Property',
          address: d.address ?? '',
          sf: d.sf ?? 0,
          status: (d.status ?? 'proposed') as Status,
          lat: d.lat ?? null,
          lng: d.lng ?? null,
          availableSf: d.availableSf ?? null,
          buildingClass: d.buildingClass ?? null,
          buildings: d.buildings ?? null,
          developer: d.developer ?? null,
          leasingCompany: d.leasingCompany ?? null,
          leasingContact: d.leasingContact ?? null,
          submarket: d.submarket ?? null,
          constructionBegin: d.constructionBegin ?? null,
          city: d.city ?? null,
          zip: d.zip ?? null,
          county: d.county ?? null,
        })),
    [rows],
  )

  const hiddenIds = useMemo(
    () => new Set(Object.entries(rows).filter(([, d]) => d.hidden).map(([id]) => id)),
    [rows],
  )

  const upsert = useCallback(async (id: string, data: OverrideData) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('property_overrides')
      .upsert({ property_id: id, data, updated_by: session?.user?.id ?? null }, { onConflict: 'property_id' })
    if (!error) setRows((prev) => ({ ...prev, [id]: data }))
    return { error: error?.message ?? null }
  }, [])

  const save = useCallback(
    (id: string, patch: OverridePatch) => upsert(id, { ...(rows[id] ?? {}), ...patch }),
    [rows, upsert],
  )
  const remove = useCallback((id: string) => upsert(id, { ...(rows[id] ?? {}), hidden: true }), [rows, upsert])
  const restore = useCallback((id: string) => upsert(id, { ...(rows[id] ?? {}), hidden: false }), [rows, upsert])

  const addProperty = useCallback(
    async (pipeline: Pipeline, fields: OverridePatch) => {
      const id = `custom-${crypto.randomUUID()}`
      const { error } = await upsert(id, { added: true, pipeline, ...fields })
      return { id, error }
    },
    [upsert],
  )

  return { apply, additions, hiddenIds, save, remove, restore, addProperty, loading }
}
