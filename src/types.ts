export type Status = 'uc' | 'proposed' | 'delivered'
export type Pipeline = 'office' | 'industrial'

export interface Property {
  /** Stable id, e.g. "office-1" / "industrial-42" */
  id: string
  pipeline: Pipeline
  /** Map pin number within the pipeline */
  num: number
  name: string
  address: string
  /** Primary size — Office SF, or Industrial RBA (rentable building area) */
  sf: number
  status: Status
  lat: number | null
  lng: number | null

  // Rich fields (mostly Industrial; optional on Office)
  buildingClass?: string | null
  availableSf?: number | null
  developer?: string | null
  leasingCompany?: string | null
  leasingContact?: string | null
  submarket?: string | null
  city?: string | null
  zip?: string | null
  county?: string | null
  parkingRatio?: number | null
  buildings?: number | null
  constructionBegin?: string | null
  /** Percent leased (0–100), from the office pipeline data */
  percentLeased?: number | null

  /** User-added photo URLs (populated once the editable backend is wired) */
  photos?: string[]
}

export interface StatusMeta {
  key: Status
  label: string
  color: string
  onColor: string
}

export const STATUS_META: Record<Status, StatusMeta> = {
  uc: { key: 'uc', label: 'Under Construction', color: '#FF6720', onColor: '#FFFFFF' },
  proposed: { key: 'proposed', label: 'Proposed Construction', color: '#3F4443', onColor: '#FFFFFF' },
  delivered: { key: 'delivered', label: 'Recently Delivered', color: '#D6001C', onColor: '#FFFFFF' },
}

/** Display order for legend, filters, totals */
export const STATUS_ORDER: Status[] = ['uc', 'proposed', 'delivered']

export interface PipelineMeta {
  key: Pipeline
  label: string
  /** Label for the primary size metric */
  sizeLabel: string
}

export const PIPELINE_META: Record<Pipeline, PipelineMeta> = {
  office: { key: 'office', label: 'Office', sizeLabel: 'SF' },
  industrial: { key: 'industrial', label: 'Industrial', sizeLabel: 'RBA' },
}

export const PIPELINE_ORDER: Pipeline[] = ['office', 'industrial']
