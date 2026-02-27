'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { confirmPollDateAction, type ActionState } from '@/app/(auth)/dashboard/braai/[id]/actions'
import type { PollOptionWithVotes } from '@/lib/repositories/date-poll-repository'

type ConfirmDateFormProps = {
  braaiId: string
  pollOptions: PollOptionWithVotes[]
}

const initialState: ActionState = {}

export function ConfirmDateForm({ braaiId, pollOptions }: ConfirmDateFormProps) {
  const [state, formAction, isPending] = useActionState(confirmPollDateAction, initialState)

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
          {state.success && (
            <p className="text-sm text-green-600">Date confirmed! The invite page will show the fixed date.</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Confirming…' : 'Confirm this date'}
          </Button>
        </form>
      )}
    </div>
  )
}
