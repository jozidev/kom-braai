'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Flame, LayoutDashboard, User, LogOut } from 'lucide-react'
import type { Organiser } from '@/lib/types'

type DashboardNavProps = {
  organiser: Organiser | null
}

export function DashboardNav({ organiser }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/dashboard', label: 'My Braais', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ]

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
          Kom Braai
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}

          {/* Avatar + sign-out */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l">
            {organiser?.avatar_url && (
              <Image
                src={organiser.avatar_url}
                alt={organiser.display_name}
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
