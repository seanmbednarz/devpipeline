export function Header() {
  return (
    <header className="flex items-center justify-between gap-3 bg-ecr-charcoal px-4 py-3 lg:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-ui text-[9px] font-semibold uppercase tracking-[0.26em] text-ecr-orange">
            Greater Austin Area
          </span>
          <span className="hidden font-ui text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 sm:inline">
            · Above 25,000 SF
          </span>
        </div>
        <h1 className="truncate font-ui text-[15px] font-extrabold uppercase leading-tight tracking-[0.04em] text-white lg:text-[18px]">
          Office Development Pipeline
        </h1>
      </div>
      <a
        href="https://ecrtx.com"
        target="_blank"
        rel="noreferrer"
        className="flex-none font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
      >
        ECR
      </a>
    </header>
  )
}
