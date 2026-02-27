import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, ExternalLink, Download } from 'lucide-react'
import { RsvpForm } from '@/components/braai/rsvp-form'
import { DatePollVote } from '@/components/braai/date-poll-vote'
import { WhatsAppShare } from '@/components/braai/whatsapp-share'
import type { BraaiWithDetails, Rsvp } from '@/lib/types'
import type { WeatherData } from '@/lib/services/weather-service'
import type { PollOptionWithVotes } from '@/lib/repositories/date-poll-repository'
import { EVENT_OPTION_DEFINITIONS } from '@/lib/config/event-options'

type InviteCardProps = {
  braai: BraaiWithDetails
  weather: WeatherData
  existingRsvp: Rsvp | null
  pollOptions: PollOptionWithVotes[]
  inviteUrl: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date TBC'
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m))
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

export function InviteCard({ braai, weather, existingRsvp, pollOptions, inviteUrl }: InviteCardProps) {
  const isCancelled = braai.status === 'cancelled'
  const isPoll = braai.date_mode === 'poll' && !braai.event_date

  const attendingRsvps = braai.rsvps.filter((r) => r.status === 'attending')
  const totalHeadcount = attendingRsvps.reduce((s, r) => s + r.attendee_count, 0)
  const isFull = braai.max_attendees != null && totalHeadcount >= braai.max_attendees

  // Event option values
  const options = (braai.event_options ?? {}) as Record<string, string | boolean>
  const kidsPolicy = options['kids_policy'] as string | undefined
  const showEtiquette = Boolean(options['show_etiquette_link'])

  const mapsDirectionsUrl = braai.venue_lat && braai.venue_lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${braai.venue_lat},${braai.venue_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(braai.venue_address)}`

  const mapsEmbedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && braai.venue_lat && braai.venue_lng
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${braai.venue_lat},${braai.venue_lng}&zoom=14`
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-5xl">🔥</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
          {braai.title}
        </h1>
        {braai.description && (
          <p className="text-white/80 text-sm">{braai.description}</p>
        )}
        <p className="text-white/70 text-xs">{weather.description}</p>
      </div>

      {/* Event details card */}
      <div className="rounded-xl bg-white/85 p-5 shadow-sm space-y-3 backdrop-blur-sm">
        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="font-semibold">{isPoll ? 'Date to be confirmed' : formatDate(braai.event_date)}</p>
            {!isPoll && braai.event_time && (
              <p className="text-sm text-muted-foreground">{formatTime(braai.event_time)}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-semibold">{braai.venue_name}</p>
            <p className="text-sm text-muted-foreground truncate">{braai.venue_address}</p>
            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-0.5 hover:underline"
            >
              Get directions <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Headcount */}
        {totalHeadcount > 0 && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <p className="text-sm">
              <span className="font-semibold">{totalHeadcount}</span> people coming
            </p>
          </div>
        )}

        {/* Organiser */}
        <div className="border-t pt-3 flex items-center gap-3">
          {braai.organiser.avatar_url && (
            <Image
              src={braai.organiser.avatar_url}
              alt={braai.organiser.display_name}
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold">{braai.organiser.display_name}</p>
            <p className="text-xs text-muted-foreground">{braai.organiser.braai_title}</p>
          </div>
        </div>
      </div>

      {/* Map embed */}
      {mapsEmbedUrl && (
        <div className="rounded-xl overflow-hidden shadow-sm h-44">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Braai location map"
          />
        </div>
      )}

      {/* Supply list */}
      {braai.supply_items.length > 0 && (
        <div className="rounded-xl bg-white/85 p-5 shadow-sm space-y-2 backdrop-blur-sm">
          <h2 className="font-bold">Bring list</h2>
          <ul className="space-y-1 text-sm">
            {braai.supply_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span className={item.provided_by === 'claimed' ? 'line-through text-muted-foreground' : ''}>
                  {item.item_name}
                </span>
                {item.provided_by === 'organiser' && (
                  <span className="text-xs text-muted-foreground">organiser</span>
                )}
                {item.provided_by === 'claimed' && item.claimed_by_name && (
                  <span className="text-xs text-green-700">✓ {item.claimed_by_name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Event options */}
      {(kidsPolicy || showEtiquette) && (
        <div className="rounded-xl bg-white/85 p-5 shadow-sm space-y-2 backdrop-blur-sm text-sm">
          {kidsPolicy && (
            <p>
              {kidsPolicy === 'welcome' ? '👶 Kids welcome' : '🔞 Adults only'}
            </p>
          )}
          {showEtiquette && (
            <Link href="/etiquette" className="inline-flex items-center gap-1 text-primary hover:underline">
              📜 Read the Braai Etiquette guide
            </Link>
          )}
        </div>
      )}

      {/* Date poll or RSVP */}
      {!isCancelled && (
        isPoll ? (
          <DatePollVote braaiSlug={braai.slug} options={pollOptions} />
        ) : (
          <RsvpForm
            braaiId={braai.id}
            braaiSlug={braai.slug}
            supplyMode={braai.supply_mode as 'byo' | 'shared'}
            availableItems={braai.supply_items}
            existingRsvp={existingRsvp}
            isFull={isFull}
          />
        )
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <WhatsAppShare
          title={braai.title}
          date={braai.event_date}
          inviteUrl={inviteUrl}
        />
        {!isPoll && (
          <a
            href={`/api/calendar/${braai.id}`}
            className="inline-flex items-center gap-2 rounded-md border bg-white/80 px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Save to Calendar
          </a>
        )}
      </div>
    </div>
  )
}
