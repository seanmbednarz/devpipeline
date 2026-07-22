import { forwardRef } from 'react'
import type { Property } from '../types'
import { STATUS_META, STATUS_ORDER } from '../types'
import { formatSf } from '../lib/format'
import { PHOTO_MANIFEST } from '../data/photoManifest'

interface PrintReportProps {
  properties: Property[]
  pipelineLabel: string
  edition: string
  /** Human summary of the active filters, e.g. "Under Construction · Georgetown". */
  subtitle: string
  /** Localized date string (built in the app so tests stay deterministic). */
  date: string
}

/**
 * Print-only report of the currently-visible properties: a branded header plus a
 * status-grouped list, each row a thumbnail + property info. Rendered off-screen
 * and revealed by the print stylesheet (see index.css). Save as PDF from the
 * browser's print dialog.
 */
export const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(function PrintReport(
  { properties, pipelineLabel, edition, subtitle, date },
  ref,
) {
  const groups = STATUS_ORDER.map((s) => ({
    status: s,
    items: properties.filter((p) => p.status === s).sort((a, b) => b.sf - a.sf),
  })).filter((g) => g.items.length > 0)

  return (
    <div ref={ref} className="print-report">
      <div className="pr-header">
        <div>
          <img className="pr-logo" src="/brand/ecr-logo.png" alt="ECR" />
          <div className="pr-kicker">Greater Austin Area</div>
          <h1 className="pr-title">{pipelineLabel} Development Pipeline</h1>
          <div className="pr-sub">{subtitle}</div>
        </div>
        <div className="pr-meta">
          {edition}
          <br />
          {date}
          <br />
          {properties.length} {properties.length === 1 ? 'project' : 'projects'}
        </div>
      </div>

      {groups.map((g) => {
        const meta = STATUS_META[g.status]
        const sf = g.items.reduce((s, p) => s + p.sf, 0)
        return (
          <div key={g.status} className="pr-group">
            <div className="pr-group-head" style={{ borderColor: meta.color }}>
              <span className="pr-dot" style={{ background: meta.color }} />
              {meta.label} — {g.items.length} {g.items.length === 1 ? 'project' : 'projects'} ·{' '}
              {formatSf(sf)}
            </div>
            {g.items.map((p) => {
              const photo = PHOTO_MANIFEST[p.id]?.[0]
              const fields = [
                p.developer && `Developer: ${p.developer}`,
                p.submarket && `Submarket: ${p.submarket}`,
                p.buildingClass && `Class ${p.buildingClass}`,
                p.buildings && `${p.buildings} bldg${p.buildings > 1 ? 's' : ''}`,
              ]
                .filter(Boolean)
                .join('   ·   ')
              return (
                <div key={p.id} className="pr-row">
                  <div className="pr-num" style={{ background: meta.color }}>
                    {p.num}
                  </div>
                  {photo ? (
                    <img className="pr-thumb" src={photo} alt="" />
                  ) : (
                    <div className="pr-thumb pr-thumb-empty" />
                  )}
                  <div className="pr-info">
                    <div className="pr-name">{p.name}</div>
                    <div className="pr-addr">
                      {p.address}
                      {p.city ? `, ${p.city}` : ''}
                    </div>
                    {fields && <div className="pr-fields">{fields}</div>}
                  </div>
                  <div className="pr-sf">{formatSf(p.sf)}</div>
                </div>
              )
            })}
          </div>
        )
      })}

      <div className="pr-footer">
        ECR · 114 W 7th St, Suite 1000 · Austin, TX 78701 · ecrtx.com
      </div>
    </div>
  )
})
