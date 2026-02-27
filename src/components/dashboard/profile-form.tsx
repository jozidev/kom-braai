'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { updateProfileAction, type ProfileFormState } from '@/app/(auth)/dashboard/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRAAI_TITLES, FIRE_PREFERENCES } from '@/lib/config/event-options'
import type { Organiser } from '@/lib/types'

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <Label htmlFor={htmlFor}>{children}</Label>
}

type ProfileFormProps = {
  organiser: Organiser
}

const initialState: ProfileFormState = {}

export function ProfileForm({ organiser }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-6 max-w-md">
      {state.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Avatar (display only — synced from Google) */}
      {organiser.avatar_url && (
        <div className="flex items-center gap-4">
          <Image
            src={organiser.avatar_url}
            alt={organiser.display_name}
            width={64}
            height={64}
            className="rounded-full"
          />
          <p className="text-sm text-muted-foreground">
            Profile picture synced from Google
          </p>
        </div>
      )}

      {/* Display name */}
      <div className="space-y-2">
        <FieldLabel htmlFor="display_name">Display name</FieldLabel>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={organiser.display_name}
          placeholder="How you appear on invite cards"
          aria-describedby={state.fieldErrors?.display_name ? 'display_name_error' : undefined}
        />
        {state.fieldErrors?.display_name && (
          <p id="display_name_error" className="text-sm text-destructive">
            {state.fieldErrors.display_name[0]}
          </p>
        )}
      </div>

      {/* Nickname */}
      <div className="space-y-2">
        <FieldLabel htmlFor="nickname">Nickname (optional)</FieldLabel>
        <Input
          id="nickname"
          name="nickname"
          defaultValue={organiser.nickname ?? ''}
          placeholder="e.g. Boet, Tannie, ou Jaco"
        />
      </div>

      {/* Fire preference */}
      <div className="space-y-2">
        <FieldLabel htmlFor="fire_preference">Fire preference</FieldLabel>
        <Select name="fire_preference" defaultValue={organiser.fire_preference}>
          <SelectTrigger id="fire_preference">
            <SelectValue placeholder="Pick your fire style" />
          </SelectTrigger>
          <SelectContent>
            {FIRE_PREFERENCES.map((pref) => (
              <SelectItem key={pref.value} value={pref.value}>
                {pref.emoji} {pref.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Braai title */}
      <div className="space-y-2">
        <FieldLabel htmlFor="braai_title">Braai title</FieldLabel>
        <Select name="braai_title" defaultValue={organiser.braai_title}>
          <SelectTrigger id="braai_title">
            <SelectValue placeholder="Pick your title" />
          </SelectTrigger>
          <SelectContent>
            {BRAAI_TITLES.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  )
}
