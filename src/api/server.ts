const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.techgallerybd.com'

export async function serverFetch<T>(
  path: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  // Read the key per-call, not at module scope: on @opennextjs/cloudflare the runtime env
  // is request-scoped, so a module-level read can run before the Cloudflare context exists.
  const apiKey = process.env.ESHOPS_API_KEY
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
    },
    next: { revalidate: options?.revalidate ?? 60 },
  })

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
