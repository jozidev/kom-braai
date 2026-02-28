import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrganiserById } from '@/lib/repositories/organiser-repository'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { DeleteAccountDialog } from '@/components/dashboard/delete-account-dialog'

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

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete your account and all associated braais, RSVPs, and bring-lists.
          </p>
        </div>
        <DeleteAccountDialog />
      </div>
    </div>
  )
}
