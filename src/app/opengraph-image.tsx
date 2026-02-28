import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Kom Braai — Organise your braai, share the link'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
        gap: 24,
      }}
    >
      {/* Flame SVG */}
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: '#fff', letterSpacing: '-2px' }}>
          Kom Braai
        </div>
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 640 }}>
          The easiest way to organise a braai and invite your mates.
        </div>
      </div>

      <div style={{ fontSize: 20, color: '#f97316', marginTop: 8 }}>
        kombraai.app
      </div>
    </div>,
    size,
  )
}
