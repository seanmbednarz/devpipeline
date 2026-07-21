import type { Pipeline, Property } from '../types'
import { STATUS_META, STATUS_ORDER } from '../types'
import { formatSf } from '../lib/format'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Totals({ properties }: { properties: Property[]; pipeline: Pipeline }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {STATUS_ORDER.map((s) => {
        const meta = STATUS_META[s]
        const list = properties.filter((p) => p.status === s)
        const sf = list.reduce((sum, p) => sum + p.sf, 0)
        return (
          <div key={s} className="overflow-hidden rounded-md" style={{ background: meta.color }}>
            <div className="px-2.5 pt-2 font-ui text-[8.5px] font-bold uppercase leading-tight tracking-[0.12em] text-white/90">
              {meta.label}
            </div>
            <div className="px-2.5 pb-2 pt-1">
              <div className="font-ui text-[14px] font-extrabold leading-none text-white">
                {formatSf(sf)}
              </div>
              <div className="mt-0.5 font-ui text-[9px] font-medium uppercase tracking-[0.1em] text-white/80">
                {list.length} {list.length === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
