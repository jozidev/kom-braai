import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Flame, Share2, CalendarCheck, Users, ScrollText, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Kom Braai — Organise your braai, share the link',
  description:
    'The easiest way to organise a braai and invite your mates. Create an event, share a link, track who\'s coming. No app required.',
  openGraph: {
    title: 'Kom Braai',
    description:
      'The easiest way to organise a braai and invite your mates.',
    type: 'website',
  },
}

const FEATURES = [
  {
    icon: Flame,
    title: 'Create in minutes',
    body: 'Set the date, location, and bring-list. Organise the wors, figure out the sides.',
  },
  {
    icon: Share2,
    title: 'Share a link',
    body: 'Send the invite via WhatsApp. Guests RSVP without creating an account.',
  },
  {
    icon: Users,
    title: 'Track who\'s coming',
    body: 'See headcount, claimed items, and manage everything from your dashboard.',
  },
  {
    icon: CalendarCheck,
    title: 'Not sure of the date?',
    body: 'Run a date poll — guests vote on which date works, you confirm when the results are in.',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 via-amber-900 to-orange-900">
      {/* Hero */}
      <div className="mx-auto max-w-2xl px-4 pt-20 pb-12 text-center space-y-6">
        <Flame className="mx-auto h-16 w-16 text-orange-300 drop-shadow-lg" aria-hidden="true" />
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl">
          Kom Braai
        </h1>
        <p className="text-xl text-white/80 max-w-md mx-auto leading-relaxed">
          The easiest way to organise a braai and invite your mates.
          No app required — just a link.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90 font-bold px-8">
                  <LayoutDashboard className="h-5 w-5" />
                  My Braais
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white"
                >
                  <Flame className="h-4 w-4" aria-hidden="true" />
                  New Braai
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/create">
                <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90 font-bold px-8">
                  <Flame className="h-5 w-5" />
                  Start a braai
                </Button>
              </Link>
              <Link href="/etiquette">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white"
                >
                  <ScrollText className="h-4 w-4" aria-hidden="true" />
                  Braai etiquette
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-2xl px-4 pb-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-orange-300 flex-shrink-0" aria-hidden="true" />
              <h2 className="font-bold text-white text-base">{title}</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* CTA strip */}
      {!user && (
        <div className="mx-auto max-w-2xl px-4 pb-20 text-center space-y-4">
          <p className="text-white/60 text-sm">
            Sign in with Google or email — it&apos;s free, no credit card needed.
          </p>
          <Link href="/dashboard/create">
            <Button
              size="lg"
              className="bg-orange-400 hover:bg-orange-300 text-orange-950 font-bold px-10"
            >
              Create your first braai →
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
