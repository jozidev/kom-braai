'use client'

import { useActionState, useState } from 'react'
import { submitPollVoteAction, type PollVoteState } from '@/app/(public)/braai/[slug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import type { PollOptionWithVotes } from '@/lib/repositories/date-poll-repository'

type DatePollVoteProps = {
  braaiId: string
  braaiSlug: string
  options: PollOptionWithVotes[]
}

const initialState: PollVoteState = {}

export function DatePollVote({ braaiId, braaiSlug, options }: DatePollVoteProps) {
  const [state, formAction, isPending] = useActionState(submitPollVoteAction, initialState)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [voterName, setVoterName] = useState('')

  const maxVotes = Math.max(...options.map((o) => o.vote_count), 1)

  if (state.success) {
    return (
      <div className="rounded-xl bg-white/80 p-6 text-center shadow-sm">
        <Check className="mx-auto mb-2 h-8 w-8 text-green-600" />
        <p className="font-semibold">Vote recorded! Thanks {voterName}.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white/80 p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-bold">When works for you?</h2>
      <p className="text-sm text-muted-foreground">
        Tap the dates that work — the organiser will confirm the best one.
      </p>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id
          const barWidth = maxVotes > 0 ? (opt.vote_count / maxVotes) * 100 : 0
          const formatted = new Date(opt.proposed_date + 'T00:00:00').toLocaleDateString('en-ZA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOptionId(isSelected ? null : opt.id)}
              className={`relative w-full rounded-lg border p-3 text-left transition-all overflow-hidden ${
                isSelected
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-white/60 hover:bg-white/90'
              }`}
            >
              {/* Vote count bar */}
              <div
                className="absolute inset-y-0 left-0 bg-primary/8 transition-all"
                style={{ width: `${barWidth}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium">{formatted}</span>
                <span className="text-xs text-muted-foreground">
                  {opt.vote_count} {opt.vote_count === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedOptionId && (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="poll_option_id" value={selectedOptionId} />
          <input type="hidden" name="slug" value={braaiSlug} />
          <input type="hidden" name="braai_id" value={braaiId} />
          <input type="hidden" name="proposed_date" value={options.find((o) => o.id === selectedOptionId)?.proposed_date ?? ''} />
          <Input
            name="voter_name"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="Your name"
            required
          />
          <Button type="submit" disabled={isPending || !voterName.trim()} className="w-full">
            {isPending ? 'Submitting...' : 'Submit vote'}
          </Button>
        </form>
      )}
    </div>
  )
}
