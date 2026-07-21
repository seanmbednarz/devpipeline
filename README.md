# ECR Office Development Pipeline

Interactive web version of ECR's **Greater Austin Office Development Pipeline** — the
replacement for the printed quarterly PDF and the previous ESRI StoryMap. Every project
plots as a numbered dot on a map of the Greater Austin area, color-coded by status, with a
synced, filterable list.

**Stack:** Vite · React · TypeScript · Tailwind · react-map-gl (MapLibre)

## Statuses

| Color | Status |
| --- | --- |
| 🟠 Orange | Under Construction |
| ⚫ Charcoal | Proposed Construction |
| 🔴 Red | Recently Delivered |

## Develop

```bash
npm install
npm run dev
```

## Map basemap

By default the app uses the free **CARTO Positron** basemap — no account or key required.

To match the ECR tenant dashboard's exact **Mapbox** look, set a token (reuse the tenant
dashboard's or create a free one at https://account.mapbox.com):

```bash
# .env
VITE_MAPBOX_TOKEN=pk.xxxxx
```

## Updating the pipeline each quarter

All project data lives in [`src/data/properties.ts`](src/data/properties.ts). Each entry:

```ts
{ num: 1, name: 'Waterline - Tower A', address: '98 Red River Street',
  sf: 715005, status: 'uc', lat: 30.261077, lng: -97.739506 }
```

- `num` — map pin number
- `sf` — square feet
- `status` — `uc` | `proposed` | `delivered`
- `lat` / `lng` — coordinates (geocode new addresses; intersections were approximated by hand)

Edit the list and redeploy.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- `public/_redirects` handles SPA routing.
