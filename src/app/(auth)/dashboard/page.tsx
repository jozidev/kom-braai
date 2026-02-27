import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Flame, Plus } from 'lucide-react'

export default function DashboardPage() {
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

      {/* Empty state — braai list built in Phase 6 */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Flame className="mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-muted-foreground">
          No braais yet
        </h2>
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
    </div>
  )
}
