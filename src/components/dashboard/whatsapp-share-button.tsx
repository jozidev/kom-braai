'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  slug: string
  title: string
  date: string | null
  className?: string
}

export function WhatsAppShareButton({ slug, title, date, className }: Props) {
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className={`gap-1.5 ${className ?? ''}`}
    >
      <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
      WhatsApp
    </Button>
  )
}
