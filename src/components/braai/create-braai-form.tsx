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
import { Plus, Trash2, Flame } from 'lucide-react'

type SupplyItemDraft = {
  item_name: string
  category: string
  provided_by: 'organiser' | 'needed'
}

const NIKS = 'Nothing / Niks'

const initialState: CreateBraaiFormState = {}

export function CreateBraaiForm() {
  const [state, formAction, isPending] = useActionState(createBraaiAction, initialState)

  const [dateMode, setDateMode] = useState<'fixed' | 'poll'>('fixed')
  const [supplyItems, setSupplyItems] = useState<SupplyItemDraft[]>([])
  const [pollDates, setPollDates] = useState<string[]>(['', ''])
  const [customOrgItem, setCustomOrgItem] = useState('')
  const [customNeededItem, setCustomNeededItem] = useState('')
  const [eventOptions, setEventOptions] = useState<Record<string, unknown>>({})

  function toggleItem(itemName: string, category: string, providedBy: 'organiser' | 'needed') {
    setSupplyItems((prev) => {
      const exists = prev.find((i) => i.item_name === itemName && i.provided_by === providedBy)
      if (exists) {
        return prev.filter((i) => !(i.item_name === itemName && i.provided_by === providedBy))
      }
      const filtered = prev.filter((i) => !(i.item_name === NIKS && i.provided_by === providedBy))
      return [...filtered, { item_name: itemName, category, provided_by: providedBy }]
    })
  }

  function toggleNiks(providedBy: 'organiser' | 'needed') {
    setSupplyItems((prev) => {
      const hasNiks = prev.some((i) => i.item_name === NIKS && i.provided_by === providedBy)
      if (hasNiks) {
        return prev.filter((i) => !(i.item_name === NIKS && i.provided_by === providedBy))
      }
      const otherSection = prev.filter((i) => i.provided_by !== providedBy)
      return [...otherSection, { item_name: NIKS, category: 'other', provided_by: providedBy }]
    })
  }

  function addCustomItem(providedBy: 'organiser' | 'needed') {
    const raw = providedBy === 'organiser' ? customOrgItem : customNeededItem
    const trimmed = raw.trim()
    if (!trimmed) return
    setSupplyItems((prev) => {
      const filtered = prev.filter((i) => !(i.item_name === NIKS && i.provided_by === providedBy))
      return [...filtered, { item_name: trimmed, category: 'other', provided_by: providedBy }]
    })
    if (providedBy === 'organiser') setCustomOrgItem('')
    else setCustomNeededItem('')
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

  function renderItemPicker(providedBy: 'organiser' | 'needed') {
    const hasNiks = supplyItems.some((i) => i.item_name === NIKS && i.provided_by === providedBy)
    const customVal = providedBy === 'organiser' ? customOrgItem : customNeededItem
    const setCustomVal = providedBy === 'organiser' ? setCustomOrgItem : setCustomNeededItem

    return (
      <div className="space-y-3">
        {/* Nothing / Niks pill */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleNiks(providedBy)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              hasNiks
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            Nothing / Niks
          </button>
        </div>

        {/* Categorised items — hidden when Niks selected */}
        {!hasNiks && categorised.map(({ category, items }) => (
          <div key={category} className="space-y-1.5">
            <p className="text-xs font-medium capitalize text-muted-foreground">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const selected = supplyItems.some(
                  (s) => s.item_name === item.label && s.provided_by === providedBy
                )
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.label, item.category, providedBy)}
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
        {!hasNiks && (
          <div className="flex gap-2">
            <Input
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder="Custom item..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCustomItem(providedBy) }
              }}
            />
            <Button type="button" variant="outline" onClick={() => addCustomItem(providedBy)}>
              Add
            </Button>
          </div>
        )}
      </div>
    )
  }

  const organiserItems = supplyItems.filter((i) => i.provided_by === 'organiser')
  const neededItems = supplyItems.filter((i) => i.provided_by === 'needed')

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
      <input type="hidden" name="supply_mode" value="shared" />

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
      <section className="space-y-6">
        <h2 className="text-lg font-semibold border-b pb-2">3. Supplies</h2>

        {/* What organiser provides */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">What I&apos;m providing</p>
            <p className="text-sm text-muted-foreground">Select what you&apos;ll have sorted.</p>
          </div>
          {renderItemPicker('organiser')}
          {organiserItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {organiserItems.map((item, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSupplyItems((prev) => prev.filter((s) => !(s.item_name === item.item_name && s.provided_by === 'organiser')))}
                >
                  {item.item_name}
                  <span className="opacity-60">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="border-t" />

        {/* What guests should bring */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Guests can bring</p>
            <p className="text-sm text-muted-foreground">Attendees can claim these on the invite.</p>
          </div>
          {renderItemPicker('needed')}
          {neededItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {neededItems.map((item, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSupplyItems((prev) => prev.filter((s) => !(s.item_name === item.item_name && s.provided_by === 'needed')))}
                >
                  {item.item_name}
                  <span className="opacity-60">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
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
        {isPending ? 'Creating braai...' : <><Flame className="h-4 w-4 mr-2 inline" aria-hidden="true" />Create Braai</>}
      </Button>
    </form>
  )
}
