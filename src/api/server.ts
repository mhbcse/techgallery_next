const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.babygallerybd.com'

export async function serverFetch<T>(
  path: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: options?.revalidate ?? 60 },
  })

  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
