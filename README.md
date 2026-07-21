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

## Photos & editing (Supabase)

Photos and inline field edits are stored in Supabase. When `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` are unset, the app runs as a static read-only build (no
sign-in, no photos). The static per-quarter data stays the source of truth —
edits are stored as **overrides** that layer on top, so a quarterly re-import
never wipes your photos or edits.

**One-time setup:**

1. **Run the schema:** Supabase Dashboard → SQL → paste
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → Run.
   (Creates the `property_photos` / `property_overrides` tables, the
   `pipeline-photos` storage bucket, and RLS: public read, signed-in write.)
2. **Add the env values** to `.env` (public API values — never the service_role key).
3. **Create your editor login:** Dashboard → Authentication → Users → Add user
   (email + password). That's the account you sign in with.

**Using it:** The sign-in entry is hidden from the public. Open the site with the
secret unlock — **`?edit`** (e.g. `https://pipeline.ecrtx.io/?edit`) — and the
sign-in modal appears. After you sign in, the session persists on your device, so
**Edit details** and **+ Add photos** stay available at the normal URL. Clients
(signed out, no `?edit`) only ever see a clean read-only site — no login button.
Editing latitude/longitude lets you fix an approximate pin.

> Security is your Supabase login + row-level security, not the hidden URL — even
> if someone finds `?edit`, they still can't sign in or write. Ask if you'd like a
> less-guessable unlock than `?edit`.

## Deploy (Cloudflare Pages)

Live at **https://devpipeline.pages.dev** (custom domain: **pipeline.ecrtx.io**).
Cloudflare Pages project: `devpipeline`. Build command `npm run build`, output
`dist`; `public/_redirects` handles SPA routing.

### Auto-deploy (GitHub Actions)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys
on every push to `main`. It needs **one** repo secret:

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with the **Cloudflare Pages :
  Edit** permission. Create at
  https://dash.cloudflare.com/profile/api-tokens → *Create Token* → *Custom* →
  add permission **Account · Cloudflare Pages · Edit** → scope to your account.
  Then add it under GitHub → repo **Settings → Secrets and variables → Actions →
  New repository secret**.

(The account id is set in the workflow; the Supabase URL + publishable key are
public and inlined there. Optionally set a `VITE_MAPBOX_TOKEN` repo *variable*.)

### Manual deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name devpipeline --branch main
```
