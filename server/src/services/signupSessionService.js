import { randomUUID } from 'crypto'

/** In-memory multi-step signup drafts (MVP). Restart clears sessions. */
const sessions = new Map()
const TTL_MS = 1000 * 60 * 30

function touch(session) {
  session.expiresAt = Date.now() + TTL_MS
}

export function createSignupSession(initialData) {
  prune()
  const id = randomUUID()
  const session = { id, data: { ...initialData }, expiresAt: Date.now() + TTL_MS }
  sessions.set(id, session)
  return id
}

export function getSignupSession(id) {
  if (!id) return null
  prune()
  const s = sessions.get(id)
  if (!s || s.expiresAt < Date.now()) {
    sessions.delete(id)
    return null
  }
  return s
}

export function mergeSignupSession(id, partial) {
  const s = getSignupSession(id)
  if (!s) return null
  s.data = { ...s.data, ...partial }
  touch(s)
  sessions.set(id, s)
  return s
}

export function deleteSignupSession(id) {
  sessions.delete(id)
}

function prune() {
  const now = Date.now()
  for (const [k, v] of sessions.entries()) {
    if (v.expiresAt < now) sessions.delete(k)
  }
}
