export type Status = 'uc' | 'proposed' | 'delivered'

export interface Property {
  /** Map pin number (1–58 in the Q4 2025 edition) */
  num: number
  name: string
  address: string
  /** Rentable square feet */
  sf: number
  status: Status
  lat: number | null
  lng: number | null
}

export interface StatusMeta {
  key: Status
  label: string
  /** Solid brand color for dots, chips, totals */
  color: string
  /** Readable text color to sit on top of `color` */
  onColor: string
}

export const STATUS_META: Record<Status, StatusMeta> = {
  uc: { key: 'uc', label: 'Under Construction', color: '#FF6720', onColor: '#FFFFFF' },
  proposed: { key: 'proposed', label: 'Proposed Construction', color: '#3F4443', onColor: '#FFFFFF' },
  delivered: { key: 'delivered', label: 'Recently Delivered', color: '#D6001C', onColor: '#FFFFFF' },
}

/** Display order for legend, filters, totals */
export const STATUS_ORDER: Status[] = ['uc', 'proposed', 'delivered']
