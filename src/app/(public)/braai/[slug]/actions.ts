'use server'

import { submitRsvp, cancelRsvp, declineRsvp } from '@/lib/services/rsvp-service'
import { sendRsvpNotification, sendPollVoteNotification } from '@/lib/services/email-service'
import { addVote } from '@/lib/repositories/date-poll-repository'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const TOKEN_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

async function setBrowserTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('kom-braai-token', token, {
    maxAge: TOKEN_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  })
}

const rsvpSchema = z.object({
  braai_id: z.string().uuid(),
  attendee_name: z.string().min(1, 'Your name is required').max(80),
  attendee_count: z.number().int().min(1).max(20),
  browser_token: z.string().min(1),
  claimed_item_ids: z.array(z.string().uuid()).optional(),
})

export type RsvpFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function submitRsvpAction(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  let claimedItemIds: string[] = []
  const claimedRaw = formData.get('claimed_item_ids')
  if (claimedRaw && typeof claimedRaw === 'string') {
    try { claimedItemIds = JSON.parse(claimedRaw) } catch { /* ignore */ }
  }

  const raw = {
    braai_id: formData.get('braai_id'),
    attendee_name: formData.get('attendee_name'),
    attendee_count: Number(formData.get('attendee_count') ?? 1),
    browser_token: formData.get('browser_token'),
    claimed_item_ids: claimedItemIds,
  }

  const parsed = rsvpSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { data, error } = await submitRsvp(parsed.data)
  if (error || !data) {
    return { error: error ?? 'Failed to RSVP. Please try again.' }
  }

  // Fire-and-forget — don't block the RSVP response
  sendRsvpNotification(parsed.data.braai_id, parsed.data.attendee_name, 'attending')

  await setBrowserTokenCookie(parsed.data.browser_token)
  revalidatePath(`/braai/${formData.get('slug')}`)
  return { success: true }
}

export async function cancelRsvpAction(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const braaiId = formData.get('braai_id') as string
  const browserToken = formData.get('browser_token') as string
  const slug = formData.get('slug') as string

  if (!braaiId || !browserToken) return { error: 'Missing data' }

  const { error } = await cancelRsvp(braaiId, browserToken)
  if (error) return { error }

  await setBrowserTokenCookie(browserToken)
  revalidatePath(`/braai/${slug}`)
  return { success: true }
}

const declineSchema = z.object({
  braai_id: z.string().uuid(),
  attendee_name: z.string().min(1, 'Your name is required').max(80),
  browser_token: z.string().min(1),
})

export async function declineRsvpAction(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const raw = {
    braai_id: formData.get('braai_id'),
    attendee_name: formData.get('attendee_name'),
    browser_token: formData.get('browser_token'),
  }

  const parsed = declineSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await declineRsvp(
    parsed.data.braai_id,
    parsed.data.browser_token,
    parsed.data.attendee_name
  )
  if (error) return { error: 'Failed to submit. Please try again.' }

  // Fire-and-forget — don't block the decline response
  sendRsvpNotification(parsed.data.braai_id, parsed.data.attendee_name, 'declined')

  await setBrowserTokenCookie(parsed.data.browser_token)
  revalidatePath(`/braai/${formData.get('slug')}`)
  return { success: true }
}

const pollVoteSchema = z.object({
  poll_option_id: z.string().uuid(),
  voter_name: z.string().min(1, 'Your name is required').max(80),
  slug: z.string(),
  braai_id: z.string().uuid(),
  proposed_date: z.string(),
})

export type PollVoteState = {
  success?: boolean
  error?: string
}

export async function submitPollVoteAction(
  _prevState: PollVoteState,
  formData: FormData
): Promise<PollVoteState> {
  const raw = {
    poll_option_id: formData.get('poll_option_id'),
    voter_name: formData.get('voter_name'),
    slug: formData.get('slug'),
    braai_id: formData.get('braai_id'),
    proposed_date: formData.get('proposed_date'),
  }

  const parsed = pollVoteSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Invalid vote data' }
  }

  const { error } = await addVote(parsed.data.poll_option_id, parsed.data.voter_name)
  if (error) return { error }

  // Fire-and-forget — don't block the vote response
  sendPollVoteNotification(parsed.data.braai_id, parsed.data.voter_name, parsed.data.proposed_date)

  revalidatePath(`/braai/${parsed.data.slug}`)
  return { success: true }
}
