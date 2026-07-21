import type { Pipeline } from '../types'
import { PIPELINE_META, PIPELINE_ORDER } from '../types'
import { AuthControl } from './AuthControl'

interface HeaderProps {
  pipeline: Pipeline
  onPipeline: (p: Pipeline) => void
}

export function Header({ pipeline, onPipeline }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 bg-ecr-charcoal px-4 py-3 lg:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-ui text-[9px] font-semibold uppercase tracking-[0.26em] text-ecr-orange">
            Greater Austin Area
          </span>
        </div>
        <h1 className="truncate font-ui text-[15px] font-extrabold uppercase leading-tight tracking-[0.04em] text-white lg:text-[18px]">
          Development Pipeline
        </h1>
      </div>

      <div className="flex flex-none items-center gap-3">
        {/* Office / Industrial toggle */}
        <div
          className="flex items-center gap-0.5 rounded-full bg-white/10 p-0.5"
          role="tablist"
          aria-label="Pipeline"
        >
          {PIPELINE_ORDER.map((p) => {
            const on = pipeline === p
            return (
              <button
                key={p}
                role="tab"
                aria-selected={on}
                onClick={() => onPipeline(p)}
                className="rounded-full px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.12em] transition-colors lg:text-[11px]"
                style={{
                  background: on ? '#FFFFFF' : 'transparent',
                  color: on ? '#3F4443' : 'rgba(255,255,255,0.7)',
                }}
              >
                {PIPELINE_META[p].label}
              </button>
            )
          })}
        </div>
        <AuthControl />
      </div>
    </header>
  )
}
