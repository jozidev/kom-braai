import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getBraaiBySlug } from '@/lib/repositories/braai-repository'
import { getRsvpByToken } from '@/lib/repositories/rsvp-repository'
import { getPollOptions } from '@/lib/repositories/date-poll-repository'
import { getWeatherForEvent } from '@/lib/services/weather-service'
import { WeatherBackground } from '@/components/braai/weather-background'
import { InviteCard } from '@/components/braai/invite-card'
import { CancelledCard } from '@/components/braai/cancelled-card'
import { RealtimeRefresher } from '@/components/braai/realtime-refresher'
import { cookies } from 'next/headers'

type PageProps = {
  params: Promise<{ slug: string }>
}

// ── Dynamic OG meta tags (task 4.11) ────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: braai } = await getBraaiBySlug(slug)

  if (!braai) {
    return { title: 'Braai not found' }
  }

  const dateStr = braai.event_date
    ? new Date(braai.event_date).toLocaleDateString('en-ZA', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : 'Date TBC'

  const description = [
    dateStr,
    braai.venue_name,
    braai.description,
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    title: `Kom Braai! 🔥 ${braai.title}`,
    description,
    openGraph: {
      title: `Kom Braai! 🔥 ${braai.title}`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Kom Braai! 🔥 ${braai.title}`,
      description,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BraaiInvitePage({ params }: PageProps) {
  const { slug } = await params
  const { data: braai } = await getBraaiBySlug(slug)

  if (!braai) notFound()

  // Build the canonical invite URL
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const inviteUrl = `${protocol}://${host}/braai/${slug}`

  // Fetch weather (only relevant for fixed-date events with coordinates)
  const eventDate = braai.event_date
    ? braai.event_date.split('T')[0]
    : null

  const weather = eventDate && braai.venue_lat && braai.venue_lng
    ? await getWeatherForEvent(braai.venue_lat, braai.venue_lng, eventDate)
    : { condition: 'unknown' as const, temperatureCelsius: null, description: 'Braai weather 🔥' }

  // Fetch date poll options (only for poll mode braais)
  const pollOptions =
    braai.date_mode === 'poll'
      ? (await getPollOptions(braai.id)).data
      : []

  // Look up existing RSVP via browser token cookie (task 4.8)
  const cookieStore = await cookies()
  const browserToken = cookieStore.get('kom-braai-token')?.value ?? null
  const existingRsvp = browserToken
    ? (await getRsvpByToken(braai.id, browserToken)).data
    : null

  return (
    <WeatherBackground>
      <RealtimeRefresher braaiId={braai.id} />
      {braai.status === 'cancelled' ? (
        <CancelledCard braai={braai} inviteUrl={inviteUrl} />
      ) : (
        <InviteCard
          braai={braai}
          weather={weather}
          existingRsvp={existingRsvp}
          pollOptions={pollOptions}
          inviteUrl={inviteUrl}
        />
      )}
    </WeatherBackground>
  )
}
