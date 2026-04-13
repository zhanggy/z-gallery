import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// ── Mock API plugin ──────────────────────────────────────────────────────────
// Simulates the server API during development.
// Replace or remove this plugin when connecting to a real backend.
// API contracts:
//   GET /api/dirs               → DirNode[]  (root-level directories)
//   GET /api/dirs?path=<path>   → DirNode[]  (children of given dir)
//   GET /api/images?dir=<path>  → string[]   (image URLs in given dir)
function mockApiPlugin(): Plugin {
  // Demo directory tree (lazy: each node only knows its own level)
  const dirMap: Record<string, Array<{ name: string; path: string; hasChildren: boolean }>> = {
    '/': [
      { name: 'Photos',      path: '/photos',      hasChildren: true  },
      { name: 'Wallpapers',  path: '/wallpapers',  hasChildren: false },
      { name: 'Screenshots', path: '/screenshots', hasChildren: false },
    ],
    '/photos': [
      { name: '2023', path: '/photos/2023', hasChildren: false },
      { name: '2024', path: '/photos/2024', hasChildren: true  },
    ],
    '/photos/2024': [
      { name: 'January',  path: '/photos/2024/01', hasChildren: false },
      { name: 'February', path: '/photos/2024/02', hasChildren: false },
    ],
  }

  // Demo images per directory (use Unsplash for placeholder images)
  const imageMap: Record<string, string[]> = {
    '/photos': [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1600',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1600',
    ],
    '/photos/2023': [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600',
    ],
    '/photos/2024': [
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1600',
    ],
    '/photos/2024/01': [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600',
    ],
    '/photos/2024/02': [
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600',
    ],
    '/wallpapers': [
      'https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?w=1600',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
    ],
    '/screenshots': [],
  }

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', `http://localhost`)

        if (url.pathname === '/api/dirs') {
          const path = url.searchParams.get('path') ?? '/'
          const dirs = dirMap[path] ?? []
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(dirs))
          return
        }

        if (url.pathname === '/api/images') {
          const dir = url.searchParams.get('dir') ?? '/'
          const images = imageMap[dir] ?? []
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(images))
          return
        }

        next()
      })
    },
  }
}
// ────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  // Use relative asset URLs so deployed builds work under subpaths/proxies.
  base: './',
  plugins: [react(), mockApiPlugin()],
  server: {
    // Expose dev server on LAN (e.g. 192.168.x.x)
    host: true,
    port: 3000,
    proxy: {
      '/api/gallery': {
        target: 'http://192.168.100.188:3008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gallery/, ''),
      },
    },
  },
})

