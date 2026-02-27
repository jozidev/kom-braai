import { createClient } from '@/lib/supabase/server'
import { getBraaiById } from '@/lib/repositories/braai-repository'
import { getPollOptions } from '@/lib/repositories/date-poll-repository'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDateForm } from '@/components/dashboard/confirm-date-form'
import { CancelBraaiDialog } from '@/components/dashboard/cancel-braai-dialog'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Package,
  Pencil,
} from 'lucide-react'

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:     { label: 'Draft',     variant: 'outline' },
  active:    { label: 'Active',    variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date TBC'
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m))
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

export default async function BraaiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: braai } = await getBraaiById(id)
  if (!braai) notFound()

  // Ensure this organiser owns this braai
  if (braai.organiser_id !== user.id) notFound()

  const isPoll = braai.date_mode === 'poll' && !braai.event_date
  const { data: pollOptions } = isPoll ? await getPollOptions(id) : { data: [] }

  const attendingRsvps = braai.rsvps.filter((r) => r.status === 'attending')
  const totalHeadcount = attendingRsvps.reduce((s, r) => s + r.attendee_count, 0)

  const badge = STATUS_BADGES[braai.status] ?? STATUS_BADGES.draft

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/braai/${braai.slug}`

  const claimedItems = braai.supply_items.filter((i) => i.provided_by === 'claimed')
  const neededItems = braai.supply_items.filter((i) => i.provided_by === 'needed')
  const organiserItems = braai.supply_items.filter((i) => i.provided_by === 'organiser')

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="space-y-3">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          My Braais
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{braai.title}</h1>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            {braai.description && (
              <p className="text-sm text-muted-foreground">{braai.description}</p>
            )}
          </div>

          {braai.status !== 'cancelled' && (
            <Link href={`/dashboard/braai/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Invite link */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Invite link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-mono text-muted-foreground break-all">/braai/{braai.slug}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/braai/${braai.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                View invite
              </Button>
            </Link>
            <CopyLinkButton slug={braai.slug} />
          </div>
        </CardContent>
      </Card>

      {/* Event details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Event details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{isPoll ? 'Date poll in progress' : formatDate(braai.event_date)}</p>
              {!isPoll && braai.event_time && (
                <p className="text-muted-foreground">{formatTime(braai.event_time)}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{braai.venue_name}</p>
              <p className="text-muted-foreground">{braai.venue_address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <p>
              <span className="font-medium">{totalHeadcount}</span> attending
              {braai.max_attendees && (
                <span className="text-muted-foreground"> / {braai.max_attendees} max</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date poll management */}
      {isPoll && pollOptions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Date poll</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfirmDateForm braaiId={id} pollOptions={pollOptions} />
          </CardContent>
        </Card>
      )}

      {/* Attendees */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Attendees {totalHeadcount > 0 && <span className="text-muted-foreground font-normal">({totalHeadcount})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendingRsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No RSVPs yet. Share the invite link!</p>
          ) : (
            <ul className="divide-y text-sm">
              {attendingRsvps.map((rsvp) => (
                <li key={rsvp.id} className="flex items-center justify-between py-2">
                  <span className="font-medium">{rsvp.attendee_name}</span>
                  <span className="text-muted-foreground">
                    {rsvp.attendee_count} {rsvp.attendee_count === 1 ? 'person' : 'people'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Supply list */}
      {braai.supply_items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Bring list
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {organiserItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You&apos;re bringing</p>
                <ul className="space-y-1">
                  {organiserItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item.item_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {claimedItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Claimed by guests</p>
                <ul className="space-y-1">
                  {claimedItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {item.item_name}
                      </span>
                      {item.claimed_by_name && (
                        <span className="text-xs text-green-700">{item.claimed_by_name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {neededItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Still needed</p>
                <ul className="space-y-1">
                  {neededItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      {item.item_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      {braai.status !== 'cancelled' && (
        <div className="rounded-lg border border-destructive/30 p-4 space-y-2">
          <p className="text-sm font-semibold text-destructive">Danger zone</p>
          <p className="text-xs text-muted-foreground">
            Cancelling will notify guests who visit the invite link. This cannot be undone.
          </p>
          <CancelBraaiDialog braaiId={id} braaiTitle={braai.title} />
        </div>
      )}
    </div>
  )
}
