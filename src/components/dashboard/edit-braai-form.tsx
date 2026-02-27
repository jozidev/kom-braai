'use client'

import { useActionState, useState } from 'react'
import { updateBraaiAction, type ActionState } from '@/app/(auth)/dashboard/braai/[id]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressPicker } from '@/components/braai/address-picker'
import { EVENT_OPTION_DEFINITIONS } from '@/lib/config/event-options'
import type { BraaiWithDetails } from '@/lib/types'

type EditBraaiFormProps = {
  braai: BraaiWithDetails
}

const initialState: ActionState = {}

export function EditBraaiForm({ braai }: EditBraaiFormProps) {
  const [state, formAction, isPending] = useActionState(updateBraaiAction, initialState)

  const existingOptions = (braai.event_options ?? {}) as Record<string, unknown>
  const [eventOptions, setEventOptions] = useState<Record<string, unknown>>(existingOptions)

  return (
    <form action={formAction} className="space-y-8 max-w-xl">
      {state.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <input type="hidden" name="braai_id" value={braai.id} />
      <input type="hidden" name="event_options" value={JSON.stringify(eventOptions)} />

      {/* ── Event details ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Event details</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={braai.title} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input id="description" name="description" defaultValue={braai.description ?? ''} />
        </div>

        {braai.date_mode === 'fixed' && (
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={braai.event_date ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Time</Label>
              <Input
                id="event_time"
                name="event_time"
                type="time"
                defaultValue={braai.event_time ?? ''}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Location ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
        <AddressPicker
          defaultVenueName={braai.venue_name}
          defaultAddress={braai.venue_address}
          defaultLat={braai.venue_lat ?? undefined}
          defaultLng={braai.venue_lng ?? undefined}
        />
      </section>

      {/* ── Options ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Options</h2>

        {EVENT_OPTION_DEFINITIONS.map((opt) => {
          if (opt.type === 'toggle') {
            return (
              <div key={opt.key} className="flex items-start gap-3">
                <Checkbox
                  id={opt.key}
                  checked={Boolean(eventOptions[opt.key] ?? opt.defaultValue)}
                  onCheckedChange={(checked) =>
                    setEventOptions((prev) => ({ ...prev, [opt.key]: checked }))
                  }
                />
                <div>
                  <label htmlFor={opt.key} className="text-sm font-medium cursor-pointer">
                    {opt.label}
                  </label>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
              </div>
            )
          }
          if (opt.type === 'select') {
            return (
              <div key={opt.key} className="space-y-2">
                <Label>{opt.label}</Label>
                <div className="flex gap-2 flex-wrap">
                  {opt.options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setEventOptions((prev) => ({ ...prev, [opt.key]: o.value }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        (eventOptions[opt.key] ?? opt.defaultValue) === o.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:bg-muted'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })}

        <div className="space-y-2">
          <Label htmlFor="max_attendees">Max attendees (optional)</Label>
          <Input
            id="max_attendees"
            name="max_attendees"
            type="number"
            min="1"
            defaultValue={braai.max_attendees ?? ''}
            placeholder="Leave empty for unlimited"
            className="max-w-[200px]"
          />
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
