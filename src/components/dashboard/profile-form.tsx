'use client'

import { useActionState, useState } from 'react'
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
import { BRAAI_TITLES, FIRE_PREFERENCES, AVATAR_OPTIONS, isEmojiAvatar } from '@/lib/config/event-options'
import { OrganiserAvatar } from '@/components/common/organiser-avatar'
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

  // Only pre-select if it's already an emoji avatar; ignore Google photo URLs
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    isEmojiAvatar(organiser.avatar_url) ? (organiser.avatar_url ?? '') : ''
  )

  return (
    <form action={formAction} className="space-y-6 max-w-md">
      {state.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <input type="hidden" name="avatar_url" value={selectedAvatar} />

      {/* Avatar picker */}
      <div className="space-y-3">
        <Label>Avatar</Label>

        <div className="flex items-center gap-4">
          <OrganiserAvatar
            avatarUrl={selectedAvatar}
            displayName={organiser.display_name}
            size={56}
          />
          <p className="text-sm text-muted-foreground">
            Pick an icon below
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedAvatar(opt.emoji)}
              aria-label={opt.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl transition-all ${
                selectedAvatar === opt.emoji
                  ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-1'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
      </div>

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
