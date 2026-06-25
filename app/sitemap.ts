import type { MetadataRoute } from 'next'
import { SITE_DOMAIN } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${SITE_DOMAIN}`

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
