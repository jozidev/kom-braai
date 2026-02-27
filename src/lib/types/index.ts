import type { Database } from './database.types'

// ============================================================
// Base row types — directly from generated schema
// ============================================================

type Tables = Database['public']['Tables']

export type Organiser = Tables['organisers']['Row']
export type Braai = Tables['braais']['Row']
export type SupplyItem = Tables['supply_items']['Row']
export type Rsvp = Tables['rsvps']['Row']
export type DatePollOption = Tables['date_poll_options']['Row']
export type DatePollVote = Tables['date_poll_votes']['Row']

// Insert types — used in repository / server action inputs
export type OrganiserInsert = Tables['organisers']['Insert']
export type BraaiInsert = Tables['braais']['Insert']
export type SupplyItemInsert = Tables['supply_items']['Insert']
export type RsvpInsert = Tables['rsvps']['Insert']
export type DatePollOptionInsert = Tables['date_poll_options']['Insert']
export type DatePollVoteInsert = Tables['date_poll_votes']['Insert']

// Update types
export type OrganiserUpdate = Tables['organisers']['Update']
export type BraaiUpdate = Tables['braais']['Update']
export type SupplyItemUpdate = Tables['supply_items']['Update']
export type RsvpUpdate = Tables['rsvps']['Update']

// ============================================================
// Composite types — for joined / enriched queries
// ============================================================

export type BraaiWithDetails = Braai & {
  organiser: Organiser
  supply_items: SupplyItem[]
  rsvps: Rsvp[]
  date_poll_options: (DatePollOption & { date_poll_votes: DatePollVote[] })[]
}

export type RsvpWithClaims = Rsvp & {
  claimed_items: SupplyItem[]
}

export type BraaiWithOrganiser = Braai & {
  organiser: Organiser
}

// ============================================================
// Domain-specific enums (matches DB check constraints)
// ============================================================

export type DateMode = 'fixed' | 'poll'
export type SupplyMode = 'byo' | 'shared'
export type BraaiStatus = 'draft' | 'active' | 'cancelled' | 'completed'
export type FirePreference = 'wood' | 'gas' | 'both'
export type SupplyItemStatus = 'organiser' | 'needed' | 'claimed'
export type RsvpStatus = 'attending' | 'cancelled'

// ============================================================
// Form / server action input types
// ============================================================

export type CreateBraaiInput = Omit<
  BraaiInsert,
  'id' | 'slug' | 'organiser_id' | 'created_at' | 'updated_at'
> & {
  supply_items: Array<{ item_name: string; category: string; provided_by: SupplyItemStatus }>
  poll_dates?: string[]
}

export type CreateRsvpInput = {
  braai_id: string
  attendee_name: string
  attendee_count: number
  browser_token: string
  claimed_item_ids?: string[]
}

export type UpdateProfileInput = Pick<
  OrganiserUpdate,
  'display_name' | 'nickname' | 'avatar_url' | 'fire_preference' | 'braai_title'
>
