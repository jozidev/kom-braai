import type { User } from '@supabase/supabase-js'
import {
  getOrganiserById,
  createOrganiser,
  updateOrganiser,
} from '@/lib/repositories/organiser-repository'
import type { Organiser, UpdateProfileInput } from '@/lib/types'
import { BRAAI_TITLES } from '@/lib/config/event-options'

/**
 * Returns the organiser profile for the given user, creating one if it doesn't
 * exist yet (first sign-in). Seeds display_name and avatar_url from Google data.
 */
export async function getOrCreateOrganiser(
  user: User
): Promise<{ data: Organiser | null; error: string | null }> {
  const existing = await getOrganiserById(user.id)
  if (existing.error) return existing
  if (existing.data) return existing

  // First sign-in — create profile from Google OAuth data
  const googleName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Braai Organiser'

  const googleAvatar =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null

  return createOrganiser({
    id: user.id,
    display_name: googleName,
    avatar_url: googleAvatar,
    fire_preference: 'both',
    braai_title: BRAAI_TITLES[0], // 'Vuurmeester' — can be changed in profile
  })
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<{ data: Organiser | null; error: string | null }> {
  return updateOrganiser(userId, input)
}
