import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, LogIn, Share2, ClipboardList, LayoutDashboard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'How it works — Kom Braai',
  description: 'Create a braai, share a link, let guests RSVP. Here\'s how Kom Braai works in four easy steps.',
}

const STEPS = [
  {
    icon: LogIn,
    step: '1',
    title: 'Sign in for free',
    body: 'Create an account with Google or your email address. No credit card, no nonsense. Takes about 30 seconds.',
    detail: 'Only the organiser needs an account — your guests never have to sign up.',
  },
  {
    icon: Flame,
    step: '2',
    title: 'Create your braai',
    body: 'Give it a name, pick a date (or run a date poll if you\'re not sure), add the venue, and set up the bring-list.',
    detail: 'The bring-list lets you split things up — you say what you\'re bringing, guests claim the rest.',
  },
  {
    icon: Share2,
    step: '3',
    title: 'Share the invite link',
    body: 'Copy the link and drop it in WhatsApp. That\'s it. No app download required for your guests.',
    detail: 'The invite page shows all the details — date, venue, who\'s coming, and what\'s still needed.',
  },
  {
    icon: ClipboardList,
    step: '4',
    title: 'Guests RSVP in seconds',
    body: 'Guests open the link, enter their name, pick how many people they\'re bringing, and claim items from the list.',
    detail: 'No login required. The page updates in real-time as people RSVP.',
  },
  {
    icon: LayoutDashboard,
    step: '5',
    title: 'Manage from your dashboard',
    body: 'Watch RSVPs come in, see the headcount, track the bring-list, and make changes any time.',
    detail: 'If plans change, you can edit the event or cancel it — guests will see the updated status.',
  },
]

type PageProps = {
  searchParams: Promise<{ from?: string }>
}

export default async function HowItWorksPage({ searchParams }: PageProps) {
  const { from } = await searchParams
  const backHref = from === 'dashboard' ? '/dashboard' : '/'

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 via-amber-900 to-orange-950">
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <Flame className="mx-auto h-12 w-12 text-orange-300 drop-shadow-lg" aria-hidden="true" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
            How it works
          </h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto">
            From zero to braai invite in under two minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/30 border border-orange-400/30">
                  <span className="text-xs font-bold text-orange-300">{s.step}</span>
                </div>
                <s.icon className="h-4 w-4 text-orange-300 flex-shrink-0" aria-hidden="true" />
                <h2 className="font-bold text-white text-base leading-snug">{s.title}</h2>
              </div>
              <p className="text-white/80 text-sm leading-relaxed pl-10">{s.body}</p>
              <p className="text-white/50 text-xs leading-relaxed pl-10">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 text-center space-y-4">
          <p className="text-white font-bold text-lg">Ready to fire it up?</p>
          <Link href="/dashboard/create">
            <Button className="bg-orange-400 hover:bg-orange-300 text-orange-950 font-bold px-8 gap-2">
              <Flame className="h-4 w-4" />
              Create your first braai
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Back link — outside card, subtle */}
        <div className="text-center pb-4">
          <Link
            href={backHref}
            className="text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            {from === 'dashboard' ? '← Back to dashboard' : '← Back to home'}
          </Link>
        </div>

      </div>
    </div>
  )
}
