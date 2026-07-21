/** 715005 -> "715,005 SF" */
export function formatSf(sf: number): string {
  return `${sf.toLocaleString('en-US')} SF`
}

/** 16735936 -> "16.7M SF" for compact totals */
export function formatSfCompact(sf: number): string {
  if (sf >= 1_000_000) return `${(sf / 1_000_000).toFixed(1)}M SF`
  if (sf >= 1_000) return `${(sf / 1_000).toFixed(0)}K SF`
  return `${sf} SF`
}
