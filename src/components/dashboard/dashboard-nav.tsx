'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Flame, Plus, LayoutDashboard, User, LogOut, ChevronDown, ScrollText, HelpCircle } from 'lucide-react'
import { OrganiserAvatar } from '@/components/common/organiser-avatar'
import type { Organiser } from '@/lib/types'

type DashboardNavProps = {
  organiser: Organiser | null
}

export function DashboardNav({ organiser }: DashboardNavProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = organiser?.display_name ?? 'Account'

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">

        {/* Left — logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
          Kom Braai
        </Link>

        {/* Right — New Braai + account dropdown */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Braai</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors">
                <OrganiserAvatar
                  avatarUrl={organiser?.avatar_url ?? null}
                  displayName={displayName}
                  size={28}
                />
                <span className="hidden sm:block font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {organiser?.braai_title ?? 'Organiser'}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  My Braais
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/how-it-works?from=dashboard" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  How it works
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/etiquette?from=dashboard" className="flex items-center gap-2 cursor-pointer">
                  <ScrollText className="h-4 w-4" />
                  Braai etiquette
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}
