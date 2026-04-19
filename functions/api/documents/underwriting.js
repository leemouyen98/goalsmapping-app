/**
 * GET /api/documents/underwriting
 * Serves Underwriting_Handbook.pdf behind JWT auth.
 */
import { getAgent } from '../_auth.js'

const ASSET_PATH = '/assets/Underwriting_Handbook.pdf'

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
  const agent = await getAgent(request, env)
  if (!agent) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const assetRequest = new Request(`${url.origin}${ASSET_PATH}`, {
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

  return new Response(assetResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="underwriting.pdf"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
