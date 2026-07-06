import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three/@react-three/fiber/drei are the entire bulk of this bundle,
    // always load together (there's no lazy-load boundary - the 3D
    // canvas is needed immediately, not a secondary feature), and rarely
    // change between deploys. Splitting them into their own vendor chunk
    // means repeat visitors' browsers can keep caching it across updates
    // that only touch game code - a real win, just not a smaller total
    // download. The vendor chunk itself is expected to sit around 1MB;
    // that's inherent to shipping a 3D engine, not something further
    // chunking would meaningfully reduce.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
