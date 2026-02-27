import { getBraaiById } from '@/lib/repositories/braai-repository'
import { generateIcsContent } from '@/lib/services/calendar-service'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ 'braai-id': string }> }
) {
  const { 'braai-id': braaiId } = await params
  const { data: braai } = await getBraaiById(braaiId)

  if (!braai) {
    return new NextResponse('Braai not found', { status: 404 })
  }

  if (!braai.event_date) {
    return new NextResponse('Event date not confirmed yet', { status: 400 })
  }

  try {
    const ics = generateIcsContent(braai)
    const filename = `${braai.slug}.ics`

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[calendar route]', err)
    return new NextResponse('Failed to generate calendar file', { status: 500 })
  }
}
