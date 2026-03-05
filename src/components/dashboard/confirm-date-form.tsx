'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { confirmPollDateAction, type ActionState } from '@/app/(auth)/dashboard/braai/[id]/actions'
import type { PollOptionWithVotes } from '@/lib/repositories/date-poll-repository'

type ConfirmDateFormProps = {
  braaiId: string
  braaiTitle: string
  inviteUrl: string
  pollOptions: PollOptionWithVotes[]
}

const initialState: ActionState = {}

export function ConfirmDateForm({ braaiId, braaiTitle, inviteUrl, pollOptions }: ConfirmDateFormProps) {
  const [state, formAction, isPending] = useActionState(confirmPollDateAction, initialState)

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  if (state.success && state.confirmedDate) {
    const dateLabel = new Date(state.confirmedDate + 'T00:00:00').toLocaleDateString('en-ZA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const message = `Date confirmed! ${braaiTitle} is on ${dateLabel}. Update your RSVP here: ${inviteUrl}`

    function shareOnWhatsApp() {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-green-700">Date confirmed: {dateLabel}</p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-900">Your guests don&apos;t know yet!</p>
          <p className="text-sm text-amber-800">
            Send the invite link again so everyone sees the confirmed date and can update their RSVP.
          </p>
          <Button type="button" onClick={shareOnWhatsApp} className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full">
            <MessageCircle className="h-4 w-4" />
            Send date update on WhatsApp
          </Button>
        </div>
      </div>
    )
  }

  const sorted = [...pollOptions].sort((a, b) => b.vote_count - a.vote_count)
  const maxVotes = sorted[0]?.vote_count ?? 0

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Vote tallies</h3>

      <div className="space-y-2">
        {sorted.map((opt) => {
          const pct = maxVotes > 0 ? Math.round((opt.vote_count / maxVotes) * 100) : 0
          const dateLabel = new Date(opt.proposed_date).toLocaleDateString('en-ZA', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          })

          return (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{dateLabel}</span>
                <span className="text-muted-foreground">
                  {opt.vote_count} vote{opt.vote_count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length > 0 && (
        <form action={formAction} className="space-y-3 border-t pt-4">
          <input type="hidden" name="braai_id" value={braaiId} />

          <div className="space-y-1">
            <p className="text-sm font-medium">Confirm a date</p>
            <select
              name="confirmed_date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={sorted[0]?.proposed_date ?? ''}
            >
              {sorted.map((opt) => (
                <option key={opt.id} value={opt.proposed_date}>
                  {new Date(opt.proposed_date).toLocaleDateString('en-ZA', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })} — {opt.vote_count} vote{opt.vote_count !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Confirming…' : 'Confirm this date'}
          </Button>
        </form>
      )}
    </div>
  )
}
