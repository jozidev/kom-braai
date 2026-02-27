import type { Metadata } from 'next'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Flame, ShieldAlert, VolumeX, Crown, Beer,
  Utensils, CircleSlash, ChefHat, ShoppingBag,
  Hourglass, UtensilsCrossed,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'The Sacred Laws of the Braai — Kom Braai',
  description:
    'A tongue-in-cheek guide to braai etiquette for the uninitiated. Read before attending any South African braai.',
  openGraph: {
    title: 'The Sacred Laws of the Braai',
    description: 'A tongue-in-cheek guide to braai etiquette for the uninitiated.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Sacred Laws of the Braai',
    description: 'A tongue-in-cheek guide to braai etiquette for the uninitiated.',
  },
}

const RULES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldAlert,
    title: 'Never touch another man\'s braai',
    body:
      'This is the cardinal rule. The braai belongs to the braai master. You may observe, admire, and offer beer — but you do not touch the tongs, the meat, or the grid. Not even if you think it\'s burning. Especially if you think it\'s burning.',
  },
  {
    icon: VolumeX,
    title: 'Don\'t ask "is it done yet?"',
    body:
      'The braai master knows. The braai master has always known. Asking implies doubt, and doubt is disrespectful. If you are hungry, eat biltong and wait quietly like the rest of us.',
  },
  {
    icon: Crown,
    title: 'The braai master\'s word is final',
    body:
      'There is no appeal process. No committee review. No second opinion. The braai master decides when to light the fire, when the coals are ready, and when the meat comes off. These are not negotiable.',
  },
  {
    icon: Beer,
    title: 'Bring more than you\'ll drink',
    body:
      'If you\'re told to bring drinks, bring more than you think is needed. It will be needed. The first law of thermodynamics states that energy cannot be created or destroyed. The first law of the braai states that drinks always run out.',
  },
  {
    icon: Utensils,
    title: 'Wors goes on first, always',
    body:
      'Boerewors is the opening ceremony of any self-respecting braai. It is both a starter and a statement of intent. Putting steaks on before wors is technically legal but will be remembered.',
  },
  {
    icon: CircleSlash,
    title: 'Don\'t call it a barbecue',
    body:
      'A barbecue is what other countries do. A braai is a lifestyle, a ceremony, and a love language. Calling it a barbecue is like calling the Springboks "a rugby team". Technically accurate, deeply offensive.',
  },
  {
    icon: Flame,
    title: 'The fire is never "too big"',
    body:
      'It\'s called ambiance. The proper response when someone builds an impressively large fire is to nod slowly and say "lekker vuur" (nice fire). Do not suggest dialling it down. You will be judged.',
  },
  {
    icon: ChefHat,
    title: 'Potjie protocol: don\'t stir someone else\'s pot',
    body:
      'A potjie is sacred. The ingredients are layered. The order is intentional. The cook has a vision. Lifting the lid uninvited is rude. Stirring it is a diplomatic incident. The correct response when someone offers you potjie is: "Did you stir it?" and hope the answer is no.',
  },
  {
    icon: ShoppingBag,
    title: 'What to bring when told "just bring yourself"',
    body:
      'You are not to arrive empty-handed. "Just bring yourself" is a social nicety, not a literal instruction. A minimum viable braai offering includes: a 6-pack, a bag of ice, or enough boerewors to justify your attendance. A bottle of wine counts as a half-attempt.',
  },
  {
    icon: Hourglass,
    title: '"The fire\'s ready" is always a lie',
    body:
      'When the braai master announces the fire is ready, go and refill your drink. Have a conversation. The coals are not ready. They won\'t be ready for another 20 minutes. This is normal. This is the braai. The waiting is part of the experience.',
  },
]

type PageProps = {
  searchParams: Promise<{ from?: string }>
}

export default async function EtiquettePage({ searchParams }: PageProps) {
  const { from } = await searchParams
  const backHref = from === 'dashboard' ? '/dashboard' : '/'
  const backLabel = from === 'dashboard' ? 'Back to dashboard' : 'Organise your own braai'

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 via-amber-900 to-orange-950">
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Flame className="mx-auto h-12 w-12 text-orange-300 drop-shadow-lg" aria-hidden="true" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
            The Sacred Laws of the Braai
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto">
            Howzit. The dos, don&apos;ts, and don&apos;t-you-dares of the South African braai.
            Study up before you pitch up.
          </p>
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {RULES.map((rule, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 space-y-2"
            >
              <div className="flex items-center gap-3">
                <rule.icon className="h-5 w-5 text-orange-300 flex-shrink-0" aria-hidden="true" />
                <h2 className="font-bold text-white text-base leading-snug">
                  <span className="text-white/50 font-normal text-sm mr-2">#{i + 1}</span>
                  {rule.title}
                </h2>
              </div>
              <p className="text-white/75 text-sm leading-relaxed pl-8">
                {rule.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 text-center space-y-3">
          <p className="text-white/70 text-sm">
            Now that you know the rules, you are ready.
          </p>
          <p className="flex items-center justify-center gap-2 text-white font-bold">
            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
            Kom braai.
          </p>
          <Link
            href={backHref}
            className="text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            {backHref === '/dashboard' ? '← Back to dashboard' : '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
