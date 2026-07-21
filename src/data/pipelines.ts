import type { Pipeline, Property } from '../types'
import { OFFICE } from './office'
import { INDUSTRIAL } from './industrial'

export const PIPELINE_DATA: Record<Pipeline, Property[]> = {
  office: OFFICE,
  industrial: INDUSTRIAL,
}
