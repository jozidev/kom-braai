import { getBraaiById } from '@/lib/repositories/braai-repository'
import { notFound } from 'next/navigation'

export default async function BraaiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: braai } = await getBraaiById(id)

  if (!braai) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{braai.title}</h1>
        <p className="text-muted-foreground">
          Invite link: <code className="text-sm">/braai/{braai.slug}</code>
        </p>
      </div>
      {/* Full dashboard detail view built in Phase 6 */}
      <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
        {JSON.stringify(braai, null, 2)}
      </pre>
    </div>
  )
}
