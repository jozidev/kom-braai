'use server'

import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/services/organiser-service'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { BRAAI_TITLES } from '@/lib/config/event-options'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(80),
  nickname: z.string().max(40).optional(),
  fire_preference: z.enum(['wood', 'gas', 'both']),
  braai_title: z.enum([...BRAAI_TITLES] as unknown as [string, ...string[]]),
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
