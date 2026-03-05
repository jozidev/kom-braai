import Link from 'next/link'
import { Calendar, MapPin, Users, ExternalLink, Download, Baby, Ban, ScrollText, Sparkles } from 'lucide-react'
import { OrganiserAvatar } from '@/components/common/organiser-avatar'
import { RsvpForm } from '@/components/braai/rsvp-form'
import { DatePollVote } from '@/components/braai/date-poll-vote'
import { WhatsAppShare } from '@/components/braai/whatsapp-share'
import { WeatherScene } from '@/components/braai/weather-scene'
import type { BraaiWithDetails, Rsvp } from '@/lib/types'
import type { WeatherData } from '@/lib/services/weather-service'
import type { PollOptionWithVotes } from '@/lib/repositories/date-poll-repository'

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

// Inner section card — sits inside the main white card
const INNER = 'rounded-xl bg-stone-50 p-4 space-y-3'

export function InviteCard({ braai, weather, existingRsvp, pollOptions, inviteUrl }: InviteCardProps) {
  const isCancelled = braai.status === 'cancelled'
  const isPoll = braai.date_mode === 'poll' && !braai.event_date

  const attendingRsvps = braai.rsvps.filter((r) => r.status === 'attending')
  const totalHeadcount = attendingRsvps.reduce((s, r) => s + r.attendee_count, 0)
  const isFull = braai.max_attendees != null && totalHeadcount >= braai.max_attendees

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
    <div className="mx-auto max-w-lg px-4 pt-10 pb-20 space-y-4">

      {/* ── Main card ── */}
      <div className="rounded-2xl bg-white shadow-2xl shadow-amber-950/20 overflow-hidden">

        {/* Illustrated scene header — includes weather badge overlay */}
        <WeatherScene
          condition={weather.condition}
          title={braai.title}
          weatherDescription={weather.description}
          temperatureCelsius={weather.temperatureCelsius}
        />

        {/* Card body */}
        <div className="p-4 space-y-3">

          {/* Description */}
          {braai.description && (
            <p className="text-sm text-stone-600 text-center px-2">{braai.description}</p>
          )}

          {/* Date & location */}
          <div className={INNER}>
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">
                  {isPoll ? 'Date to be confirmed' : formatDate(braai.event_date)}
                </p>
                {isPoll && (
                  <p className="text-xs text-amber-700 mt-0.5 font-medium">Vote on your preferred date below ↓</p>
                )}
                {!isPoll && braai.event_time && (
                  <p className="text-xs text-stone-500 mt-0.5">{formatTime(braai.event_time)}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <MapPin className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-sm">{braai.venue_name}</p>
                <p className="text-xs text-stone-500 truncate mt-0.5">{braai.venue_address}</p>
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 mt-1 hover:text-amber-900 transition-colors"
                >
                  Get directions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Headcount */}
            {totalHeadcount > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-sm text-stone-700">
                  <span className="font-bold text-stone-900">{totalHeadcount}</span> people coming
                  <Sparkles className="inline h-3.5 w-3.5 text-amber-400 ml-1" aria-hidden="true" />
                </p>
              </div>
            )}
          </div>

          {/* Organiser */}
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
            <OrganiserAvatar
              avatarUrl={braai.organiser.avatar_url}
              displayName={braai.organiser.display_name}
              size={36}
              className="flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-stone-900">{braai.organiser.display_name}</p>
              <p className="text-xs text-amber-600/80">{braai.organiser.braai_title}</p>
            </div>
          </div>

          {/* Supply list */}
          {braai.supply_items.length > 0 && (() => {
            const organiserItems = braai.supply_items.filter((i) => i.provided_by === 'organiser')
            const guestItems = braai.supply_items.filter((i) => i.provided_by === 'needed' || i.provided_by === 'claimed')
            return (
              <div className={INNER}>
                {organiserItems.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600/70">I&apos;ll supply</h2>
                    <ul className="space-y-1.5">
                      {organiserItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm text-stone-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                          {item.item_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guestItems.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600/70">You can bring</h2>
                    <ul className="space-y-1.5">
                      {guestItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span className={`flex items-center gap-2 text-sm ${item.provided_by === 'claimed' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.provided_by === 'claimed' ? 'bg-green-400' : 'bg-stone-300'}`} />
                            {item.item_name}
                          </span>
                          {item.provided_by === 'claimed' && item.claimed_by_name && (
                            <span className="text-xs font-semibold text-green-700">✓ {item.claimed_by_name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Event options */}
          {(kidsPolicy || showEtiquette) && (
            <div className={`${INNER} !space-y-2`}>
              {kidsPolicy && (
                <p className="flex items-center gap-2 text-sm text-stone-800">
                  {kidsPolicy === 'welcome'
                    ? <><Baby className="h-4 w-4 text-stone-500 flex-shrink-0" aria-hidden="true" /> Kids welcome</>
                    : <><Ban  className="h-4 w-4 text-stone-500 flex-shrink-0" aria-hidden="true" /> Adults only</>
                  }
                </p>
              )}
              {showEtiquette && (
                <Link href="/etiquette" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors">
                  <ScrollText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  Read the Braai Etiquette guide
                </Link>
              )}
            </div>
          )}

          {/* Map embed — just above RSVP */}
          {mapsEmbedUrl && (
            <div className="rounded-xl overflow-hidden h-40">
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

          {/* RSVP / Date poll */}
          {!isCancelled && (
            isPoll ? (
              <DatePollVote braaiId={braai.id} braaiSlug={braai.slug} options={pollOptions} />
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
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <WhatsAppShare
              title={braai.title}
              date={braai.event_date}
              inviteUrl={inviteUrl}
            />
            {!isPoll && (
              <a
                href={`/api/calendar/${braai.id}`}
                className="inline-flex items-center gap-2 h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Save to Calendar
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Subtle promo */}
      <p className="text-center text-xs text-amber-900/60">
        Hosting your own braai?{' '}
        <Link href="/" className="font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-900 transition-colors">
          Kom Braai
        </Link>
      </p>
    </div>
  )
}
