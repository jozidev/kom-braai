'use client'

import { useActionState, useRef, useEffect } from 'react'
import { addSupplyItemAction, deleteSupplyItemAction, type ActionState } from '@/app/(auth)/dashboard/braai/[id]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import type { SupplyItem } from '@/lib/types'

type Props = {
  braaiId: string
  items: SupplyItem[]
}

const initialState: ActionState = {}

export function SupplyListEditor({ braaiId, items }: Props) {
  const [addState, addAction, addPending] = useActionState(addSupplyItemAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (addState.success) formRef.current?.reset()
  }, [addState])

  const organiserItems = items.filter((i) => i.provided_by === 'organiser')
  const neededItems = items.filter((i) => i.provided_by === 'needed')
  const claimedItems = items.filter((i) => i.provided_by === 'claimed')

  return (
    <div className="space-y-4">
      {/* Organiser items */}
      {organiserItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">I'll supply</p>
          <ul className="space-y-1">
            {organiserItems.map((item) => (
              <ItemRow key={item.id} item={item} braaiId={braaiId} />
            ))}
          </ul>
        </div>
      )}

      {/* Needed items */}
      {neededItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guests can bring</p>
          <ul className="space-y-1">
            {neededItems.map((item) => (
              <ItemRow key={item.id} item={item} braaiId={braaiId} />
            ))}
          </ul>
        </div>
      )}

      {/* Claimed items (read-only) */}
      {claimedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Claimed by guests</p>
          <ul className="space-y-1">
            {claimedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm py-0.5">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {item.item_name}
                </span>
                {item.claimed_by_name && (
                  <span className="text-xs text-green-700">✓ {item.claimed_by_name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No items yet — add some below.</p>
      )}

      {/* Add item form */}
      <form ref={formRef} action={addAction} className="space-y-2 pt-2 border-t">
        <input type="hidden" name="braai_id" value={braaiId} />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add item</p>
        <div className="flex gap-2">
          <Input
            name="item_name"
            placeholder="e.g. Boerewors, Ice, Koeksisters…"
            className="flex-1 h-8 text-sm"
            required
          />
          <select
            name="provided_by"
            defaultValue="organiser"
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="organiser">I'll supply</option>
            <option value="needed">Guests bring</option>
          </select>
          <Button type="submit" size="sm" disabled={addPending}>
            {addPending ? '…' : 'Add'}
          </Button>
        </div>
        {addState.error && (
          <p className="text-xs text-destructive">{addState.error}</p>
        )}
      </form>
    </div>
  )
}

function ItemRow({ item, braaiId }: { item: SupplyItem; braaiId: string }) {
  const [, deleteAction, deletePending] = useActionState(deleteSupplyItemAction, initialState)

  return (
    <li className="flex items-center justify-between text-sm py-0.5 group">
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
        {item.item_name}
      </span>
      <form action={deleteAction}>
        <input type="hidden" name="braai_id" value={braaiId} />
        <input type="hidden" name="item_id" value={item.id} />
        <button
          type="submit"
          disabled={deletePending}
          aria-label={`Remove ${item.item_name}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </form>
    </li>
  )
}
