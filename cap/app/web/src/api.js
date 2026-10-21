// Small OData V4 client for the CAP services.
// Locally the CAP server uses mocked users with basic auth, so in dev mode a user can be picked in the
// header. On BTP the approuter handles login (XSUAA session cookie) and requires a CSRF token for writes.

export const SRC = '/odata/v4/src'
export const DETAILS = '/odata/v4/details'
export const ADMIN = '/odata/v4/admin'

export const DEV_USERS = import.meta.env.DEV ? ['alice', 'bob', 'carol'] : []

let devUser = null
if (import.meta.env.DEV) {
  try { devUser = localStorage.getItem('devUser') || 'alice' } catch { devUser = 'alice' }
}
let language = 'ar'
let csrfToken = null

export function getDevUser() { return devUser }
export function setDevUser(user) {
  devUser = user
  try { localStorage.setItem('devUser', user) } catch { /* storage unavailable */ }
}
export function setApiLanguage(lang) { language = lang }

export class ApiError extends Error {
  constructor(status, message, details = []) {
    super(message)
    this.status = status
    this.details = details
  }
  /** All messages, the top-level one first unless it only says "see details". */
  get messages() {
    if (!this.details.length) return [{ message: this.message }]
    return this.details
  }
}

function baseHeaders() {
  const headers = { Accept: 'application/json', 'Accept-Language': language }
  if (devUser) headers.Authorization = 'Basic ' + btoa(`${devUser}:${devUser}`)
  return headers
}

async function fetchCsrfToken() {
  const res = await fetch(`${SRC}/`, { headers: { ...baseHeaders(), 'X-CSRF-Token': 'Fetch' }, credentials: 'same-origin' })
  csrfToken = res.headers.get('x-csrf-token') || 'unsafe'
}

async function request(method, url, body, retried = false) {
  const headers = baseHeaders()
  if (method !== 'GET') {
    if (!csrfToken) await fetchCsrfToken()
    headers['X-CSRF-Token'] = csrfToken
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  if (res.status === 403 && res.headers.get('x-csrf-token')?.toLowerCase() === 'required' && !retried) {
    csrfToken = null
    return request(method, url, body, true)
  }
  // approuter session expired: reload to log in again
  if (res.status === 401 && !devUser) {
    window.location.reload()
    throw new ApiError(401, 'Session expired')
  }
  if (!res.ok) {
    let error = { message: res.statusText }
    try { error = (await res.json()).error ?? error } catch { /* not JSON */ }
    throw new ApiError(res.status, error.message, error.details ?? [])
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: url => request('GET', url),
  list: async url => (await request('GET', url)).value,
  create: (url, data) => request('POST', url, data),
  update: (url, data) => request('PATCH', url, data),
  remove: url => request('DELETE', url),
  action: (url, data = {}) => request('POST', url, data)
}

/** OData key segment for a single-key entity: UUIDs unquoted, strings quoted. */
export function key(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? `(${value})`
    : `('${encodeURIComponent(String(value).replace(/'/g, "''"))}')`
}
