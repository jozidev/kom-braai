'use server'

import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/services/organiser-service'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { BRAAI_TITLES } from '@/lib/config/event-options'
import { headers } from 'next/headers'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(80),
  nickname: z.string().max(40).optional(),
  fire_preference: z.enum(['wood', 'gas', 'both']),
  braai_title: z.enum([...BRAAI_TITLES] as unknown as [string, ...string[]]),
  avatar_url: z.string().max(512).optional(),
})

export type ProfileFormState = {
  error?: string
  fieldErrors?: Partial<Record<keyof z.infer<typeof profileSchema>, string[]>>
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const raw = {
    display_name: formData.get('display_name'),
    nickname: formData.get('nickname') || undefined,
    fire_preference: formData.get('fire_preference'),
    braai_title: formData.get('braai_title'),
    avatar_url: formData.get('avatar_url') || undefined,
  }

  const parsed = profileSchema.safeParse(raw)

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await updateProfile(user.id, parsed.data)

  if (error) {
    return { error: 'Failed to save profile. Please try again.' }
  }

  redirect('/dashboard')
}

export type DeleteAccountState = { error?: string }

export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirm = formData.get('confirm') as string

  if (confirm !== 'DELETE') {
    return { error: 'Please type DELETE to confirm.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const res = await fetch(`${origin}/api/auth/delete-account`, {
    method: 'POST',
    headers: { Cookie: headersList.get('cookie') ?? '' },
  })

  if (!res.ok) {
    return { error: 'Failed to delete account. Please try again.' }
  }

  await supabase.auth.signOut()
  redirect('/')
}
