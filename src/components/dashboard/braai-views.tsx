'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import { WhatsAppShareButton } from '@/components/dashboard/whatsapp-share-button'
import { LayoutGrid, CalendarDays, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Braai } from '@/lib/types'

// ── Shared helpers ────────────────────────────────────────────────────────────

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:     { label: 'Draft',     variant: 'outline' },
  active:    { label: 'Active',    variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' },
}

function formatDate(braai: Braai): string {
  if (braai.date_mode === 'poll' && !braai.event_date) return 'Date poll'
  if (!braai.event_date) return 'No date set'
  return new Date(braai.event_date).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isPast(braai: Braai): boolean {
  if (braai.status === 'cancelled' || braai.status === 'completed') return true
  if (!braai.event_date) return false
  const today = new Date().toISOString().slice(0, 10)
  return braai.event_date < today
}

// ── Grid view ─────────────────────────────────────────────────────────────────

function GridView({ braais }: { braais: Braai[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {braais.map((braai) => {
        const badge = STATUS_BADGES[braai.status] ?? STATUS_BADGES.draft
        return (
          <Card key={braai.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">{braai.title}</CardTitle>
                <Badge variant={badge.variant} className="shrink-0">{badge.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(braai)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground truncate">{braai.venue_name}</p>
              <div className="space-y-2 pt-1">
                <Link href={`/dashboard/braai/${braai.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">Manage</Button>
                </Link>
                <div className="grid grid-cols-3 gap-1">
                  <Link href={`/braai/${braai.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="w-full gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View invite
                    </Button>
                  </Link>
                  <CopyLinkButton slug={braai.slug} className="w-full" />
                  <WhatsAppShareButton slug={braai.slug} title={braai.title} date={braai.event_date} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ── Calendar view ─────────────────────────────────────────────────────────────

function CalendarView({ braais }: { braais: Braai[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // Build 42-cell grid starting from the Sunday before the 1st
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(year, month, 1 - startOffset + i)
    return { date: d, inMonth: d.getMonth() === month }
  })

  // Index braais by date string
  const byDate: Record<string, Braai[]> = {}
  const noDates: Braai[] = []
  for (const b of braais) {
    if (b.event_date) {
      const key = b.event_date.slice(0, 10)
      if (!byDate[key]) byDate[key] = []
      byDate[key].push(b)
    } else {
      noDates.push(b)
    }
  }

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{MONTH_NAMES[month]} {year}</span>
          {(year !== today.getFullYear() || month !== today.getMonth()) && (
            <button
              onClick={goToday}
              className="text-xs text-muted-foreground hover:text-foreground border rounded px-1.5 py-0.5 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="gap-1">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {DAY_LABELS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 divide-x divide-y">
          {cells.map(({ date, inMonth }, i) => {
            const key = date.toISOString().slice(0, 10)
            const cellBraais = byDate[key] ?? []
            const isToday = key === todayStr
            const isOtherMonth = !inMonth

            return (
              <div
                key={i}
                className={`min-h-[72px] p-1.5 text-xs ${isOtherMonth ? 'bg-muted/20' : ''}`}
              >
                <span className={`
                  inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium mb-1
                  ${isToday ? 'bg-orange-500 text-white' : isOtherMonth ? 'text-muted-foreground/40' : 'text-muted-foreground'}
                `}>
                  {date.getDate()}
                </span>

                <div className="space-y-0.5">
                  {cellBraais.map(b => {
                    const past = isPast(b)
                    const badge = STATUS_BADGES[b.status] ?? STATUS_BADGES.draft
                    return (
                      <Link
                        key={b.id}
                        href={`/dashboard/braai/${b.id}`}
                        className={`block truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium transition-opacity hover:opacity-80 ${
                          past
                            ? 'bg-muted text-muted-foreground opacity-40'
                            : badge.variant === 'destructive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                        }`}
                        title={b.title}
                      >
                        {b.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* No-date braais */}
      {noDates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">No date set</p>
          <div className="flex flex-wrap gap-2">
            {noDates.map(b => {
              const badge = STATUS_BADGES[b.status] ?? STATUS_BADGES.draft
              return (
                <Link key={b.id} href={`/dashboard/braai/${b.id}`}>
                  <Badge variant={badge.variant} className="cursor-pointer hover:opacity-80 transition-opacity">
                    {b.title}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

type View = 'grid' | 'calendar'

export function BraaiViews({ braais }: { braais: Braai[] }) {
  const [view, setView] = useState<View>('grid')

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {braais.length} {braais.length === 1 ? 'braai' : 'braais'}
        </p>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`rounded p-1.5 transition-colors ${view === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`rounded p-1.5 transition-colors ${view === 'calendar' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Calendar view"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'grid' ? <GridView braais={braais} /> : <CalendarView braais={braais} />}
    </div>
  )
}
