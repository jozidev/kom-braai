'use client'

import { useActionState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cancelBraaiAction, type ActionState } from '@/app/(auth)/dashboard/braai/[id]/actions'

type CancelBraaiDialogProps = {
  braaiId: string
  braaiTitle: string
}

const initialState: ActionState = {}

export function CancelBraaiDialog({ braaiId, braaiTitle }: CancelBraaiDialogProps) {
  const [state, formAction, isPending] = useActionState(cancelBraaiAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // The action redirects on success, so no extra handling needed.
  // Only show error if something goes wrong.

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Cancel braai</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this braai?</DialogTitle>
          <DialogDescription>
            This will mark <span className="font-semibold">{braaiTitle}</span> as cancelled.
            Guests who visit the invite link will see a cancellation notice. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {state.error && (
          <p className="text-sm text-destructive px-1">{state.error}</p>
        )}

        <DialogFooter className="gap-2">
          <form ref={formRef} action={formAction}>
            <input type="hidden" name="braai_id" value={braaiId} />
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Cancelling…' : 'Yes, cancel it'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
