import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kombraai.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_pages: MetadataRoute.Sitemap = [
    { url: APP_URL, priority: 1, changeFrequency: 'weekly' },
    { url: `${APP_URL}/etiquette`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${APP_URL}/how-it-works`, priority: 0.7, changeFrequency: 'monthly' },
  ]

  // Include active public braai invite pages
  const supabase = await createClient()
  const { data: braais } = await supabase
    .from('braais')
    .select('slug, updated_at')
    .in('status', ['active'])
    .order('updated_at', { ascending: false })
    .limit(500)

  const braai_pages: MetadataRoute.Sitemap = (braais ?? []).map((b) => ({
    url: `${APP_URL}/braai/${b.slug}`,
    lastModified: b.updated_at ?? undefined,
    priority: 0.5,
    changeFrequency: 'daily' as const,
  }))

  return [...static_pages, ...braai_pages]
}
