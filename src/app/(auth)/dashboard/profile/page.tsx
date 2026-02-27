import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrganiserById } from '@/lib/repositories/organiser-repository'
import { ProfileForm } from '@/components/dashboard/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: organiser } = await getOrganiserById(user.id)

  if (!organiser) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          How you appear on your braai invite cards
        </p>
      </div>
      <ProfileForm organiser={organiser} />
    </div>
  )
}
