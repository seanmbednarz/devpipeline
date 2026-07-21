import type { RequestParameters } from 'maplibre-gl'

/**
 * Basemap selection.
 *
 * Default (no token): CARTO "Positron" — a free, key-less light basemap whose
 * clean cream/gray palette matches the ECR print pipeline. Always renders.
 *
 * With VITE_MAPBOX_TOKEN set: Mapbox "light-v11" — the exact basemap used by the
 * ECR tenant dashboard. MapLibre renders the Mapbox style via the transform below.
 * Reuse the tenant dashboard's token, or create a free one at account.mapbox.com.
 */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

export const USING_MAPBOX = Boolean(MAPBOX_TOKEN)

export const MAP_STYLE = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${MAPBOX_TOKEN}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

/** Basemap attribution shown in the corner (kept compact but present). */
export const ATTRIBUTION = MAPBOX_TOKEN
  ? '© Mapbox © OpenStreetMap'
  : '© OpenStreetMap © CARTO'

/**
 * Rewrites `mapbox://` URLs (sprites, glyphs, tiles, TileJSON) to their token-authenticated
 * HTTPS equivalents so MapLibre can load a Mapbox-hosted style. No-op without a token.
 */
export function transformRequest(url: string): RequestParameters | undefined {
  if (!MAPBOX_TOKEN || !url.startsWith('mapbox://')) return undefined
  const withToken = (u: string) => `${u}${u.includes('?') ? '&' : '?'}access_token=${MAPBOX_TOKEN}`
  const rest = url.replace('mapbox://', '')

  if (rest.startsWith('styles/')) return { url: withToken(`https://api.mapbox.com/${rest}`) }
  if (rest.startsWith('sprites/'))
    return { url: withToken(`https://api.mapbox.com/styles/v1/${rest.replace('sprites/', '')}/sprite`) }
  if (rest.startsWith('fonts/'))
    return { url: withToken(`https://api.mapbox.com/fonts/v1/${rest.replace('fonts/', '')}`) }
  // Tileset / TileJSON source, e.g. mapbox://mapbox.mapbox-streets-v8
  return { url: withToken(`https://api.mapbox.com/v4/${rest}.json?secure`) }
}
