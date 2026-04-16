/**
 * GET /api/documents/plan
 * Serves the 5-in-1 完整保障计划 PDF behind JWT auth.
 * The raw asset URL stays inaccessible to unauthenticated requests
 * because this function intercepts the canonical fetch path.
 */
import { getAgent } from '../_auth.js'

const ASSET_PATH = '/assets/5-in-1%20%E5%AE%8C%E6%95%B4%E4%BF%9D%E9%9A%9C%E8%AE%A1%E5%88%92.pdf'

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    },
  })
}

export async function onRequestGet({ request, env }) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const agent = await getAgent(request, env)
  if (!agent) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Fetch the static asset via the Pages ASSETS binding ───────────────────
  const origin = new URL(request.url).origin
  const assetRequest = new Request(`${origin}${ASSET_PATH}`, {
    method: 'GET',
    headers: { Accept: 'application/pdf' },
  })

  let assetResponse
  try {
    assetResponse = await env.ASSETS.fetch(assetRequest)
  } catch {
    return new Response(JSON.stringify({ error: 'Document not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!assetResponse.ok) {
    return new Response(JSON.stringify({ error: 'Document not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Return PDF with protective headers ────────────────────────────────────
  // Content-Disposition: inline  → browser renders, does not prompt save-as
  // Cache-Control: no-store      → no cached copy left on device
  // X-Robots-Tag: noindex        → search engines won't index if accidentally crawled
  return new Response(assetResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="plan.pdf"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
