'use client'

// Minimal client component — forces Next.js to generate
// (dashboard)/page_client-reference-manifest.js during build.
// Without this, Vercel's output file tracer throws ENOENT on that file.
// See: docs/gotchas/nextjs14-vercel-build-gotchas.md GOTCHA-002
export default function ClientInit() {
  return null
}
