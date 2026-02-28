import { ImageResponse } from 'next/og'
import { getBraaiBySlug } from '@/lib/repositories/braai-repository'

export const runtime = 'edge'
export const alt = 'Kom Braai invite'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function Image({ params }: Props) {
  const { slug } = await params
  const { data: braai } = await getBraaiBySlug(slug)

  const title = braai?.title ?? 'Braai time!'
  const dateStr = braai?.event_date
    ? new Date(braai.event_date).toLocaleDateString('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : null
  const venue = braai?.venue_name ?? null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #3d1a08 0%, #78350f 50%, #3d1a08 100%)',
        gap: 20,
        padding: 60,
      }}
    >
      {/* Flame + app name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>Kom Braai</div>
      </div>

      {/* Braai title */}
      <div style={{ fontSize: 64, fontWeight: 800, color: '#fff', textAlign: 'center', letterSpacing: '-1px', lineHeight: 1.1 }}>
        {title}
      </div>

      {/* Date + venue */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {dateStr && (
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)' }}>{dateStr}</div>
        )}
        {venue && (
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }}>{venue}</div>
        )}
      </div>
    </div>,
    size,
  )
}
