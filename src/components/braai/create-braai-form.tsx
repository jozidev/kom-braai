'use client'

import { useActionState, useState } from 'react'
import { createBraaiAction, type CreateBraaiFormState } from '@/app/(auth)/dashboard/create/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AddressPicker } from '@/components/braai/address-picker'
import { PREDEFINED_SUPPLY_ITEMS, SUPPLY_CATEGORIES, EVENT_OPTION_DEFINITIONS } from '@/lib/config/event-options'
import type { SupplyCategory } from '@/lib/config/event-options'
import { Plus, Trash2 } from 'lucide-react'

type SupplyItemDraft = {
  item_name: string
  category: string
  provided_by: 'organiser' | 'needed'
}

const initialState: CreateBraaiFormState = {}

export function CreateBraaiForm() {
  const [state, formAction, isPending] = useActionState(createBraaiAction, initialState)

  const [dateMode, setDateMode] = useState<'fixed' | 'poll'>('fixed')
  const [supplyMode, setSupplyMode] = useState<'byo' | 'shared'>('byo')
  const [supplyItems, setSupplyItems] = useState<SupplyItemDraft[]>([])
  const [pollDates, setPollDates] = useState<string[]>(['', ''])
  const [customItem, setCustomItem] = useState('')
  const [eventOptions, setEventOptions] = useState<Record<string, unknown>>({})

  function togglePredefinedItem(itemId: string, itemName: string, category: string) {
    const status: SupplyItemDraft['provided_by'] = supplyMode === 'byo' ? 'organiser' : 'needed'
    const exists = supplyItems.find((i) => i.item_name === itemName)
    if (exists) {
      setSupplyItems((prev) => prev.filter((i) => i.item_name !== itemName))
    } else {
      setSupplyItems((prev) => [...prev, { item_name: itemName, category, provided_by: status }])
    }
  }

  function addCustomItem() {
    const trimmed = customItem.trim()
    if (!trimmed) return
    setSupplyItems((prev) => [...prev, { item_name: trimmed, category: 'other', provided_by: supplyMode === 'byo' ? 'organiser' : 'needed' }])
    setCustomItem('')
  }

  function addPollDate() {
    if (pollDates.length < 5) setPollDates((prev) => [...prev, ''])
  }

  function removePollDate(index: number) {
    setPollDates((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePollDate(index: number, value: string) {
    setPollDates((prev) => prev.map((d, i) => (i === index ? value : d)))
  }

  const categorised = SUPPLY_CATEGORIES.map((cat) => ({
    category: cat as SupplyCategory,
    items: PREDEFINED_SUPPLY_ITEMS.filter((i) => i.category === cat),
  })).filter((c) => c.items.length > 0)

  return (
    <form action={formAction} className="space-y-10 max-w-xl">
      {state.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Hidden fields for complex state */}
      <input type="hidden" name="supply_items" value={JSON.stringify(supplyItems)} />
      <input type="hidden" name="poll_dates" value={JSON.stringify(pollDates.filter(Boolean))} />
      <input type="hidden" name="event_options" value={JSON.stringify(eventOptions)} />
      <input type="hidden" name="date_mode" value={dateMode} />
      <input type="hidden" name="supply_mode" value={supplyMode} />

      {/* ── Section 1: Event details ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">1. Event details</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Saturday Braai at Jaco's" required />
          {state.fieldErrors?.title && (
            <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input id="description" name="description" placeholder="Celebrating Jaco's birthday — bring your A-game" />
        </div>

        {/* Date mode toggle */}
        <div className="space-y-2">
          <Label>Date</Label>
          <div className="flex gap-2">
            {(['fixed', 'poll'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDateMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                  dateMode === mode
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-muted'
                }`}
              >
                {mode === 'fixed' ? 'Fixed date' : 'Date poll'}
              </button>
            ))}
          </div>
        </div>

        {dateMode === 'fixed' ? (
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input id="event_date" name="event_date" type="date" required />
              {state.fieldErrors?.event_date && (
                <p className="text-sm text-destructive">{state.fieldErrors.event_date[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Time</Label>
              <Input id="event_time" name="event_time" type="time" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Proposed dates (2–5)</Label>
            {pollDates.map((date, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => updatePollDate(i, e.target.value)}
                  required
                />
                {pollDates.length > 2 && (
                  <button type="button" onClick={() => removePollDate(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {pollDates.length < 5 && (
              <Button type="button" variant="outline" size="sm" onClick={addPollDate} className="gap-2">
                <Plus className="h-4 w-4" /> Add date option
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ── Section 2: Location ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">2. Location</h2>
        <AddressPicker />
        {state.fieldErrors?.venue_name && (
          <p className="text-sm text-destructive">{state.fieldErrors.venue_name[0]}</p>
        )}
        {state.fieldErrors?.venue_address && (
          <p className="text-sm text-destructive">{state.fieldErrors.venue_address[0]}</p>
        )}
      </section>

      {/* ── Section 3: Supplies ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">3. Supplies</h2>

        <div className="flex gap-2">
          {(['byo', 'shared'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSupplyMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                supplyMode === mode
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-muted'
              }`}
            >
              {mode === 'byo' ? 'Bring your own' : 'Shared / Potjie'}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {supplyMode === 'byo'
            ? 'Tick what you\'re providing. Attendees sort themselves out.'
            : 'Tick items needed. Attendees can claim them on the invite.'}
        </p>

        {categorised.map(({ category, items }) => (
          <div key={category} className="space-y-2">
            <p className="text-sm font-medium capitalize text-muted-foreground">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const selected = supplyItems.some((s) => s.item_name === item.label)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePredefinedItem(item.id, item.label, item.category)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Custom item */}
        <div className="flex gap-2">
          <Input
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Custom item..."
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem() } }}
          />
          <Button type="button" variant="outline" onClick={addCustomItem}>Add</Button>
        </div>

        {/* Selected items summary */}
        {supplyItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {supplyItems.map((item, i) => (
              <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSupplyItems((prev) => prev.filter((_, idx) => idx !== i))}>
                {item.item_name}
                <span className="opacity-60">×</span>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 4: Event options ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">4. Options</h2>
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
            placeholder="Leave empty for unlimited"
            className="max-w-[200px]"
          />
        </div>
      </section>

      {/* ── Submit ── */}
      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Creating braai...' : '🔥 Create Braai'}
      </Button>
    </form>
  )
}
