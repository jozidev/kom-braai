import { WhatsAppShare } from '@/components/braai/whatsapp-share'
import type { BraaiWithDetails } from '@/lib/types'

type CancelledCardProps = {
  braai: BraaiWithDetails
  inviteUrl: string
}

export function CancelledCard({ braai, inviteUrl }: CancelledCardProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-6">
      <p className="text-6xl">🌧️</p>
      <h1 className="text-2xl font-extrabold text-white drop-shadow">
        Braai Cancelled
      </h1>
      <div className="rounded-xl bg-white/85 p-6 shadow-sm backdrop-blur-sm space-y-3">
        <p className="font-semibold text-lg">{braai.title}</p>
        <p className="text-muted-foreground text-sm">
          Unfortunately this braai has been called off. The fire has gone out. 💔
        </p>
        <p className="text-sm">
          Organised by <span className="font-medium">{braai.organiser.display_name}</span>
        </p>
      </div>
      <WhatsAppShare
        title={`${braai.title} — CANCELLED`}
        date={braai.event_date}
        inviteUrl={inviteUrl}
      />
    </div>
  )
}
