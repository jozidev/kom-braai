import { createClient } from '@/lib/supabase/server'
import type { DatePollOption, DatePollOptionInsert, DatePollVote } from '@/lib/types'

export type PollOptionWithVotes = DatePollOption & {
  date_poll_votes: DatePollVote[]
  vote_count: number
}

export async function createPollOptions(
  options: DatePollOptionInsert[]
): Promise<{ data: DatePollOption[]; error: string | null }> {
  if (options.length === 0) return { data: [], error: null }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('date_poll_options')
    .insert(options)
    .select()

  if (error) {
    console.error('[date-poll-repository] createPollOptions:', error.message)
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function getPollOptions(
  braaiId: string
): Promise<{ data: PollOptionWithVotes[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('date_poll_options')
    .select('*, date_poll_votes(*)')
    .eq('braai_id', braaiId)
    .order('proposed_date', { ascending: true })

  if (error) {
    console.error('[date-poll-repository] getPollOptions:', error.message)
    return { data: [], error: error.message }
  }

  const withCounts = (data ?? []).map((opt) => ({
    ...opt,
    vote_count: opt.date_poll_votes.length,
  }))

  return { data: withCounts, error: null }
}

export async function addVote(
  pollOptionId: string,
  voterName: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('date_poll_votes')
    .insert({ poll_option_id: pollOptionId, voter_name: voterName })

  if (error) {
    console.error('[date-poll-repository] addVote:', error.message)
    return { error: error.message }
  }

  return { error: null }
}

export async function getVoteTallies(
  braaiId: string
): Promise<{ data: PollOptionWithVotes[]; error: string | null }> {
  return getPollOptions(braaiId)
}

export async function confirmDate(
  braaiId: string,
  confirmedDate: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('braais')
    .update({
      event_date: confirmedDate,
      date_mode: 'fixed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', braaiId)

  if (error) {
    console.error('[date-poll-repository] confirmDate:', error.message)
    return { error: error.message }
  }

  return { error: null }
}
