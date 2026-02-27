'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

type CopyLinkButtonProps = {
  slug: string
  className?: string
}

export function CopyLinkButton({ slug, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/braai/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="sm" className={`gap-1.5 ${className ?? ''}`} onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </>
      )}
    </Button>
  )
}
