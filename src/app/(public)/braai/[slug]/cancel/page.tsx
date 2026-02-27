import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getBraaiBySlug } from '@/lib/repositories/braai-repository'
import { WeatherBackground } from '@/components/braai/weather-background'
import { CancelledCard } from '@/components/braai/cancelled-card'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: braai } = await getBraaiBySlug(slug)

  if (!braai) return { title: 'Braai not found' }

  return {
    title: `${braai.title} — Cancelled`,
    description: `Unfortunately ${braai.title} has been cancelled.`,
  }
}

export default async function BraaiCancelPage({ params }: PageProps) {
  const { slug } = await params
  const { data: braai } = await getBraaiBySlug(slug)

  if (!braai) notFound()

  // If braai is not actually cancelled, redirect to the main invite page
  if (braai.status !== 'cancelled') {
    redirect(`/braai/${slug}`)
  }

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const inviteUrl = `${protocol}://${host}/braai/${slug}`

  return (
    <WeatherBackground>
      <CancelledCard braai={braai} inviteUrl={inviteUrl} />
    </WeatherBackground>
  )
}
