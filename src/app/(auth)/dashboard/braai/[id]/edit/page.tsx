import { createClient } from '@/lib/supabase/server'
import { getBraaiById } from '@/lib/repositories/braai-repository'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditBraaiForm } from '@/components/dashboard/edit-braai-form'

export default async function EditBraaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: braai } = await getBraaiById(id)
  if (!braai) notFound()
  if (braai.organiser_id !== user.id) notFound()
  if (braai.status === 'cancelled') redirect(`/dashboard/braai/${id}`)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/braai/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to braai
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Edit braai</h1>
          <p className="text-muted-foreground text-sm">Update the details for {braai.title}.</p>
        </div>
      </div>

      <EditBraaiForm braai={braai} />
    </div>
  )
}
