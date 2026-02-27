import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBraaisByOrganiser } from '@/lib/repositories/braai-repository'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Plus, ExternalLink } from 'lucide-react'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import { WhatsAppShareButton } from '@/components/dashboard/whatsapp-share-button'
import type { Braai } from '@/lib/types'

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: braais } = await getBraaisByOrganiser(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Braais</h1>
        <Link href="/dashboard/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Braai
          </Button>
        </Link>
      </div>

      {braais.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Flame className="mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-muted-foreground">No braais yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fire it up — create your first braai and share the link.
          </p>
          <Link href="/dashboard/create" className="mt-4">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create a Braai
            </Button>
          </Link>
        </div>
      ) : (
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
                    <div className="flex items-center gap-1">
                      <Link href={`/braai/${braai.slug}`} target="_blank" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Invite
                        </Button>
                      </Link>
                      <CopyLinkButton slug={braai.slug} />
                      <WhatsAppShareButton slug={braai.slug} title={braai.title} date={braai.event_date} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
