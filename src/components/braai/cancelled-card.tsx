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
      <h1 className="text-3xl font-extrabold text-white" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}>
        Braai Cancelled
      </h1>
      <div className="rounded-2xl bg-amber-50/95 p-6 shadow-2xl shadow-amber-950/15 backdrop-blur-sm border border-white/50 space-y-3">
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
