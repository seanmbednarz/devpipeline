import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Marks the app's module script with data-cfasync="false" so Cloudflare Rocket
// Loader (enabled on the ecrtx.io zone) leaves it alone. Rocket Loader otherwise
// defers/rewrites the ES module and the app never mounts on pipeline.ecrtx.io.
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
