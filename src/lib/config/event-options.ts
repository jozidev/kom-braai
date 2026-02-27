// ============================================================
// Kom Braai — Event configuration
// Add new options here without any schema changes.
// ============================================================

// ---- Supply items ----

export const SUPPLY_CATEGORIES = [
  'meat',
  'bread',
  'sides',
  'drinks',
  'fire',
  'other',
] as const

export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number]

export type PredefinedSupplyItem = {
  id: string
  label: string
  category: SupplyCategory
}

export const PREDEFINED_SUPPLY_ITEMS: PredefinedSupplyItem[] = [
  // Meat
  { id: 'own_meat', label: 'Own meat', category: 'meat' },
  { id: 'wors', label: 'Boerewors', category: 'meat' },
  { id: 'chops', label: 'Lamb chops', category: 'meat' },
  { id: 'steak', label: 'Steak', category: 'meat' },
  { id: 'chicken', label: 'Chicken', category: 'meat' },
  { id: 'ribs', label: 'Ribs', category: 'meat' },
  { id: 'sosaties', label: 'Sosaties', category: 'meat' },
  // Bread
  { id: 'braaibroodjies', label: 'Braaibroodjies', category: 'bread' },
  { id: 'rolls', label: 'Rolls / bread', category: 'bread' },
  // Sides
  { id: 'salad', label: 'Salad', category: 'sides' },
  { id: 'potato_salad', label: 'Potato salad', category: 'sides' },
  { id: 'dessert', label: 'Dessert', category: 'sides' },
  { id: 'biltong', label: 'Biltong / snacks', category: 'sides' },
  // Drinks
  { id: 'ice', label: 'Ice', category: 'drinks' },
  { id: 'dop', label: 'Drinks / dop', category: 'drinks' },
  { id: 'cooldrinks', label: 'Cooldrinks / soft drinks', category: 'drinks' },
  // Fire
  { id: 'charcoal', label: 'Charcoal', category: 'fire' },
  { id: 'wood', label: 'Wood', category: 'fire' },
  { id: 'firelighters', label: 'Firelighters', category: 'fire' },
]

// ---- Braai titles ----

export const BRAAI_TITLES = [
  'Vuurmeester',
  'Sous Chef',
  'Braai Boss',
  'Potjie King/Queen',
  'Just Here for the Dop',
  'Rookie',
] as const

export type BraaiTitle = (typeof BRAAI_TITLES)[number]

// ---- Fire preferences ----

export type FirePreferenceOption = {
  value: 'wood' | 'gas' | 'both'
  label: string
  emoji: string
}

export const FIRE_PREFERENCES: FirePreferenceOption[] = [
  { value: 'wood', label: 'Wood fire', emoji: '🪵' },
  { value: 'gas', label: 'Gas', emoji: '🔥' },
  { value: 'both', label: 'Both — whatever it takes', emoji: '🔥🪵' },
]

// ---- Event option definitions ----
// These map to keys stored in braais.event_options (jsonb).
// New options can be added here without any schema changes.

export type EventOptionType = 'select' | 'toggle'

export type SelectEventOptionDefinition = {
  key: string
  type: 'select'
  label: string
  options: Array<{ value: string; label: string }>
  defaultValue: string
}

export type ToggleEventOptionDefinition = {
  key: string
  type: 'toggle'
  label: string
  description: string
  defaultValue: boolean
}

export type EventOptionDefinition =
  | SelectEventOptionDefinition
  | ToggleEventOptionDefinition

export const EVENT_OPTION_DEFINITIONS: EventOptionDefinition[] = [
  {
    key: 'kids_policy',
    type: 'select',
    label: 'Kids',
    options: [
      { value: 'welcome', label: 'Bring the kids' },
      { value: 'adults_only', label: 'Leave the kids' },
    ],
    defaultValue: 'welcome',
  },
  {
    key: 'show_etiquette_link',
    type: 'toggle',
    label: 'Etiquette link',
    description: 'Show a link to the braai etiquette guide on the invite',
    defaultValue: false,
  },
]

// ---- Avatar options (emoji icons for organiser profile) ----

export type AvatarOption = {
  id: string
  emoji: string
  label: string
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'fire',    emoji: '🔥', label: 'Fire' },
  { id: 'meat',    emoji: '🥩', label: 'Meat' },
  { id: 'wors',    emoji: '🌭', label: 'Wors' },
  { id: 'ribs',    emoji: '🍖', label: 'Ribs' },
  { id: 'beer',    emoji: '🍺', label: 'Beer' },
  { id: 'chef',    emoji: '🧑‍🍳', label: 'Chef' },
  { id: 'wood',    emoji: '🪵', label: 'Wood' },
  { id: 'potjie',  emoji: '🫕', label: 'Potjie' },
  { id: 'lion',    emoji: '🦁', label: 'Lion' },
  { id: 'rugby',   emoji: '🏉', label: 'Rugby' },
  { id: 'sun',     emoji: '☀️', label: 'Sun' },
  { id: 'braai',   emoji: '🍗', label: 'Chicken' },
]

/** True if the avatar_url value is an emoji icon rather than a photo URL */
export function isEmojiAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl) return false
  return !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')
}

// ---- Helper to get default event_options jsonb value ----

export function getDefaultEventOptions(): Record<string, string | boolean> {
  return Object.fromEntries(
    EVENT_OPTION_DEFINITIONS.map((opt) => [opt.key, opt.defaultValue])
  )
}
