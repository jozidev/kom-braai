import Image from 'next/image'
import { isEmojiAvatar } from '@/lib/config/event-options'

type OrganiserAvatarProps = {
  avatarUrl: string | null | undefined
  displayName: string
  size?: number
  className?: string
}

/**
 * Renders either an emoji avatar badge or a Google profile photo,
 * depending on the format of avatarUrl.
 */
export function OrganiserAvatar({
  avatarUrl,
  displayName,
  size = 36,
  className = '',
}: OrganiserAvatarProps) {
  if (isEmojiAvatar(avatarUrl)) {
    const px = size <= 28 ? 'text-base' : size <= 36 ? 'text-xl' : 'text-2xl'
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-orange-100 leading-none ${px} ${className}`}
        style={{ width: size, height: size }}
        aria-label={displayName}
        role="img"
      >
        {avatarUrl}
      </span>
    )
  }

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        className={`rounded-full flex-shrink-0 ${className}`}
      />
    )
  }

  // Fallback: initial letter badge
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-orange-500 text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={displayName}
    >
      {displayName.charAt(0).toUpperCase()}
    </span>
  )
}
