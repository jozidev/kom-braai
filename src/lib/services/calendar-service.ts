import type { BraaiWithDetails } from '@/lib/types'

function formatIcsDate(dateStr: string, timeStr?: string | null): string {
  // Returns YYYYMMDDTHHMMSSZ or YYYYMMDD
  const date = new Date(dateStr)
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    date.setUTCHours(h, m, 0, 0)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  // All-day event format
  return dateStr.replace(/-/g, '').split('T')[0]
}

function escapeIcs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function generateIcsContent(braai: BraaiWithDetails): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const uid = `${braai.id}@kom-braai`

  const dtStart = braai.event_date
    ? formatIcsDate(braai.event_date, braai.event_time)
    : null

  if (!dtStart) {
    throw new Error('Cannot generate calendar file: event date not confirmed')
  }

  // End time: start + 4 hours (typical braai duration), or next day for all-day
  let dtEnd: string
  if (braai.event_time) {
    const endDate = new Date(braai.event_date!)
    const [h, m] = braai.event_time.split(':').map(Number)
    endDate.setUTCHours(h + 4, m, 0, 0)
    dtEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  } else {
    // Next day for all-day event
    const d = new Date(braai.event_date!)
    d.setDate(d.getDate() + 1)
    dtEnd = d.toISOString().split('T')[0].replace(/-/g, '')
  }

  const location = [braai.venue_name, braai.venue_address].filter(Boolean).join(', ')
  const mapsUrl = braai.venue_lat && braai.venue_lng
    ? `https://www.google.com/maps?q=${braai.venue_lat},${braai.venue_lng}`
    : `https://www.google.com/maps/search/?q=${encodeURIComponent(braai.venue_address)}`

  const description = [
    braai.description,
    `Organised by ${braai.organiser.display_name} (${braai.organiser.braai_title})`,
    `Directions: ${mapsUrl}`,
  ].filter(Boolean).join('\\n\\n')

  const isAllDay = !braai.event_time
  const dtStartProp = isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`
  const dtEndProp = isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kom Braai//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    dtStartProp,
    dtEndProp,
    `SUMMARY:🔥 ${escapeIcs(braai.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
