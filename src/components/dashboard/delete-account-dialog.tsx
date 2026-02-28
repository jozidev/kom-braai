'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { deleteAccountAction, type DeleteAccountState } from '@/app/(auth)/dashboard/profile/actions'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={disabled || pending}>
      {pending ? 'Deleting…' : 'Delete my account'}
    </Button>
  )
}

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [state, action] = useActionState<DeleteAccountState, FormData>(
    deleteAccountAction,
    {}
  )

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setConfirm('')
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete account</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account and all your braais, RSVPs, and
            bring-lists. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              name="confirm"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <SubmitButton disabled={confirm !== 'DELETE'} />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
