'use client'

import { MessageCircle } from 'lucide-react'

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
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors"
    >
      <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
      Share on WhatsApp
    </button>
  )
}
