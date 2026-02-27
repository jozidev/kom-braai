// Braai-themed slug words
const ADJECTIVES = [
  'lekker', 'braai', 'vuur', 'warm', 'sout', 'rooi', 'groot', 'goed',
  'vet', 'vars', 'stil', 'vrolik', 'lank', 'nuwe', 'mooi',
]

const NOUNS = [
  'vuur', 'vleis', 'wors', 'braai', 'kole', 'rook', 'vlam', 'potjie',
  'chop', 'boer', 'dop', 'mates', 'jol', 'vuurtjie', 'skaap',
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomHex(length: number): string {
  const chars = '0123456789abcdef'
  return Array.from({ length }, () => randomElement(chars.split(''))).join('')
}

/**
 * Generates a fun braai-themed slug like "lekker-vuur-7f3a".
 * Caller should check uniqueness and retry if needed.
 */
export function generateSlug(): string {
  const adj = randomElement(ADJECTIVES)
  const noun = randomElement(NOUNS)
  const suffix = randomHex(4)
  return `${adj}-${noun}-${suffix}`
}
