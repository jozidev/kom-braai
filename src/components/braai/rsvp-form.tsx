'use client'

import { useActionState, useState, useEffect } from 'react'
import { submitRsvpAction, cancelRsvpAction, declineRsvpAction, type RsvpFormState } from '@/app/(public)/braai/[slug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Minus, Plus, X, Flame } from 'lucide-react'
import type { Rsvp, SupplyItem } from '@/lib/types'

type RsvpFormProps = {
  braaiId: string
  braaiSlug: string
  supplyMode: 'byo' | 'shared'
  availableItems: SupplyItem[]
  existingRsvp: Rsvp | null
  isFull: boolean
}

const BROWSER_TOKEN_KEY = 'kom-braai-token'

function getBrowserToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(BROWSER_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(BROWSER_TOKEN_KEY, token)
  }
  return token
}

const initialState: RsvpFormState = {}

export function RsvpForm({
  braaiId,
  braaiSlug,
  supplyMode,
  availableItems,
  existingRsvp,
  isFull,
}: RsvpFormProps) {
  const [state, formAction, isPending] = useActionState(submitRsvpAction, initialState)
  const [cancelState, cancelFormAction, cancelPending] = useActionState(cancelRsvpAction, initialState)
  const [declineState, declineFormAction, declinePending] = useActionState(declineRsvpAction, initialState)

  const [attendeeCount, setAttendeeCount] = useState(existingRsvp?.attendee_count ?? 1)
  const [claimedIds, setClaimedIds] = useState<string[]>([])
  const [browserToken, setBrowserToken] = useState('')

  useEffect(() => {
    setBrowserToken(getBrowserToken())
  }, [])

  function toggleClaim(itemId: string) {
    setClaimedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const neededItems = availableItems.filter((i) => i.provided_by === 'needed')
  const claimedItems = availableItems.filter((i) => i.provided_by === 'claimed')

  // Already declined
  if (existingRsvp && existingRsvp.status === 'declined') {
    return (
      <div className="rounded-xl bg-stone-50 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-muted-foreground">
            {existingRsvp.attendee_name}, you said you can&apos;t make it.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Changed your mind? You&apos;re still welcome!</p>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="braai_id" value={braaiId} />
          <input type="hidden" name="slug" value={braaiSlug} />
          <input type="hidden" name="browser_token" value={browserToken} />
          <input type="hidden" name="attendee_count" value={1} />
          <input type="hidden" name="claimed_item_ids" value="[]" />
          <div className="space-y-2">
            <Label htmlFor="attendee_name_undecline">Your name</Label>
            <Input
              id="attendee_name_undecline"
              name="attendee_name"
              defaultValue={existingRsvp.attendee_name}
              required
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={isPending} className="w-full gap-2">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {isPending ? 'Updating…' : 'Actually, I can make it!'}
          </Button>
        </form>
      </div>
    )
  }

  // Already RSVP'd — show edit/cancel state
  if (existingRsvp && existingRsvp.status === 'attending') {
    return (
      <div className="rounded-xl bg-stone-50 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <p className="font-semibold">
            You&apos;re coming, {existingRsvp.attendee_name}!
            <Flame className="inline h-4 w-4 text-orange-500 ml-1" aria-hidden="true" />
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {existingRsvp.attendee_count > 1
            ? `${existingRsvp.attendee_count} people (including you)`
            : 'Just you'}
        </p>
        {cancelState.error && (
          <p className="text-sm text-destructive">{cancelState.error}</p>
        )}
        <form action={cancelFormAction}>
          <input type="hidden" name="braai_id" value={braaiId} />
          <input type="hidden" name="browser_token" value={browserToken} />
          <input type="hidden" name="slug" value={braaiSlug} />
          <Button type="submit" variant="outline" size="sm" disabled={cancelPending} className="gap-2">
            <X className="h-4 w-4" />
            {cancelPending ? 'Cancelling...' : 'Cancel my RSVP'}
          </Button>
        </form>
      </div>
    )
  }

  if (state.success) {
    return (
      <div className="rounded-xl bg-stone-50 p-4 text-center">
        <Check className="mx-auto mb-2 h-10 w-10 text-green-600" />
        <p className="text-lg font-bold flex items-center justify-center gap-1.5">
          Lekker, you&apos;re in!
          <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
        </p>
        <p className="text-sm text-muted-foreground mt-1">See you at the braai.</p>
      </div>
    )
  }

  if (isFull) {
    return (
      <div className="rounded-xl bg-stone-50 p-4 text-center">
        <p className="font-semibold text-destructive">This braai is full.</p>
        <p className="text-sm text-muted-foreground mt-1">The organiser set a headcount limit.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-stone-50 p-4 space-y-5">
      <h2 className="text-lg font-bold text-stone-900">RSVP</h2>

      {state.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="braai_id" value={braaiId} />
        <input type="hidden" name="slug" value={braaiSlug} />
        <input type="hidden" name="browser_token" value={browserToken} />
        <input type="hidden" name="attendee_count" value={attendeeCount} />
        <input type="hidden" name="claimed_item_ids" value={JSON.stringify(claimedIds)} />

        <div className="space-y-2">
          <Label htmlFor="attendee_name">Your name</Label>
          <Input
            id="attendee_name"
            name="attendee_name"
            placeholder="e.g. Jaco"
            required
            autoComplete="given-name"
          />
          {state.fieldErrors?.attendee_name && (
            <p className="text-sm text-destructive">{state.fieldErrors.attendee_name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>How many people? (including you)</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAttendeeCount((n) => Math.max(1, n - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-lg">{attendeeCount}</span>
            <button
              type="button"
              onClick={() => setAttendeeCount((n) => Math.min(20, n + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Supply claiming (shared mode only) */}
        {supplyMode === 'shared' && neededItems.length > 0 && (
          <div className="space-y-2">
            <Label>Bring anything? (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {neededItems.map((item) => {
                const isClaimed = claimedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleClaim(item.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isClaimed
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white border-border hover:bg-muted'
                    }`}
                  >
                    {isClaimed && <Check className="mr-1 inline h-3 w-3" />}
                    {item.item_name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Already claimed */}
        {claimedItems.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Already sorted:</p>
            <ul className="space-y-0.5">
              {claimedItems.map((item) => (
                <li key={item.id}>✓ {item.item_name} — {item.claimed_by_name}</li>
              ))}
            </ul>
          </div>
        )}

        {(state.error || declineState.error) && (
          <p className="text-sm text-destructive">{state.error ?? declineState.error}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            formAction={declineFormAction}
            variant="outline"
            size="sm"
            disabled={declinePending}
            className="flex-1"
          >
            {declinePending ? 'Sending…' : "Can't make it"}
          </Button>
          <Button type="submit" size="sm" disabled={isPending} className="flex-1 gap-1.5">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {isPending ? 'RSVPing…' : "I'm coming!"}
          </Button>
        </div>
      </form>
    </div>
  )
}
