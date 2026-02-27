'use client'

import { MessageCircle } from 'lucide-react'

type Props = {
  slug: string
  title: string
  date: string | null
}

export function WhatsAppShareButton({ slug, title, date }: Props) {
  function handleShare() {
    const inviteUrl = `${window.location.origin}/braai/${slug}`
    const dateStr = date
      ? new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
      : ''
    const message = dateStr
      ? `Kom Braai! ${title} on ${dateStr} — ${inviteUrl}`
      : `Kom Braai! ${title} — ${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
      WhatsApp
    </button>
  )
}
