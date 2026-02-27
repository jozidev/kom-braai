import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrganiserById } from '@/lib/repositories/organiser-repository'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: organiser } = await getOrganiserById(user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav organiser={organiser} />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}
