'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type WhatsAppShareProps = {
  title: string
  date: string | null
  inviteUrl: string
}

export function WhatsAppShare({ title, date, inviteUrl }: WhatsAppShareProps) {
  function handleShare() {
    const dateStr = date
      ? new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
      : ''
    const message = dateStr
      ? `Kom Braai! 🔥 ${title} on ${dateStr} — ${inviteUrl}`
      : `Kom Braai! 🔥 ${title} — ${inviteUrl}`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="gap-2 bg-white/80 hover:bg-white border-border"
    >
      <MessageCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
      Share on WhatsApp
    </Button>
  )
}
