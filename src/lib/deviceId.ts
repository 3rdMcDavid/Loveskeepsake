let _cached: string | null = null

export async function getDeviceId(): Promise<string> {
  if (typeof window === 'undefined') return 'ssr'
  if (_cached) return _cached

  const KEY = 'lk_device_id'
  const stored = localStorage.getItem(KEY)

  try {
    const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    _cached = result.visitorId
    localStorage.setItem(KEY, _cached)
    return _cached
  } catch {
    if (stored) {
      _cached = stored
      return _cached
    }
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    _cached = id
    return _cached
  }
}
