import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Marks the app's module script with data-cfasync="false" so Cloudflare Rocket
// Loader (if ever enabled on the ecrtx.io zone) leaves it alone.
// (The raw photo-import archive under public/property photos/ is stripped from
// dist by the build script, so only optimized copies in public/photos/ ship.)
function cfasyncFalse() {
  return {
    name: 'cfasync-false',
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        return html.replace(/<script (type="module")/g, '<script data-cfasync="false" $1')
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), cfasyncFalse()],
})
