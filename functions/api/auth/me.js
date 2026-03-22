import { getAgent, json, cors } from '../_auth.js'

export async function onRequestOptions() {
  return cors()
}

export async function onRequestGet({ request, env }) {
  const agent = await getAgent(request, env)
  if (!agent) return json({ error: 'Unauthorized' }, 401)
  return json({ agent: { code: agent.sub, name: agent.name } })
}
