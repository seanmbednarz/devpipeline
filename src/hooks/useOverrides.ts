import { useCallback, useEffect, useState } from 'react'
import type { Property } from '../types'
import { supabase } from '../lib/supabase'

/** Editable subset of a property; stored as JSON in property_overrides.data */
export type OverridePatch = Partial<
  Pick<
    Property,
    | 'name'
    | 'address'
    | 'sf'
    | 'status'
    | 'lat'
    | 'lng'
    | 'availableSf'
    | 'buildingClass'
    | 'buildings'
    | 'developer'
    | 'leasingCompany'
    | 'leasingContact'
    | 'submarket'
    | 'constructionBegin'
  >
>

/**
 * Loads all field overrides once and exposes a merge helper + save. Overrides
 * layer over the static per-quarter data so re-imports never lose your edits.
 */
export function useOverrides() {
  const [overrides, setOverrides] = useState<Record<string, OverridePatch>>({})
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase!.from('property_overrides').select('property_id, data')
      if (!cancelled && !error && data) {
        const map: Record<string, OverridePatch> = {}
        for (const row of data) map[row.property_id as string] = (row.data as OverridePatch) ?? {}
        setOverrides(map)
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Merge a property with its stored override (dropping null/empty patch values). */
  const apply = useCallback(
    (p: Property): Property => {
      const patch = overrides[p.id]
      if (!patch) return p
      const clean: OverridePatch = {}
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined && v !== null && v !== '') (clean as Record<string, unknown>)[k] = v
      }
      return { ...p, ...clean }
    },
    [overrides],
  )

  const save = useCallback(async (propertyId: string, patch: OverridePatch) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('property_overrides')
      .upsert(
        { property_id: propertyId, data: patch, updated_by: session?.user?.id ?? null },
        { onConflict: 'property_id' },
      )
    if (!error) setOverrides((prev) => ({ ...prev, [propertyId]: patch }))
    return { error: error?.message ?? null }
  }, [])

  return { overrides, apply, save, loading }
}
