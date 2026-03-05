import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBraaiById } from '@/lib/repositories/braai-repository'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Kom Braai <noreply@kombraai.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kombraai.app'

export async function sendPollVoteNotification(
  braaiId: string,
  voterName: string,
  proposedDate: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const { data: braai } = await getBraaiById(braaiId)
  if (!braai) return

  const admin = createAdminClient()
  const { data: { user } } = await admin.auth.admin.getUserById(braai.organiser_id)
  if (!user?.email) return

  const manageUrl = `${APP_URL}/dashboard/braai/${braaiId}`

  const formattedDate = new Date(proposedDate).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1c1917;">

  <div style="background: linear-gradient(135deg, #3d1a08, #78350f); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <p style="color: #f97316; font-size: 32px; margin: 0;">🔥</p>
    <p style="color: white; font-size: 20px; font-weight: bold; margin: 8px 0 0;">${braai.title}</p>
  </div>

  <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
    ${voterName} voted on a date
  </p>

  <p style="color: #57534e; margin-bottom: 24px;">
    They voted for <strong>${formattedDate}</strong>.
  </p>

  <a href="${manageUrl}"
     style="display: inline-block; background: #ea580c; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px;">
    View your braai →
  </a>

  <p style="color: #a8a29e; font-size: 12px; margin-top: 32px;">
    You're receiving this because you organised a braai on <a href="${APP_URL}" style="color: #a8a29e;">Kom Braai</a>.
  </p>

</body>
</html>`

  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `📅 ${voterName} voted on a date for ${braai.title}`,
    html,
  }).catch((err) => {
    console.error('[email-service] sendPollVoteNotification failed:', err)
  })
}

export async function sendRsvpNotification(
  braaiId: string,
  attendeeName: string,
  status: 'attending' | 'declined'
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const { data: braai } = await getBraaiById(braaiId)
  if (!braai) return

  const admin = createAdminClient()
  const { data: { user } } = await admin.auth.admin.getUserById(braai.organiser_id)
  if (!user?.email) return

  const totalAttending = braai.rsvps
    .filter((r) => r.status === 'attending')
    .reduce((sum, r) => sum + r.attendee_count, 0)

  const manageUrl = `${APP_URL}/dashboard/braai/${braaiId}`

  const isAttending = status === 'attending'

  const subject = isAttending
    ? `🔥 ${attendeeName} is coming to ${braai.title}!`
    : `${attendeeName} can't make it to ${braai.title}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1c1917;">

  <div style="background: linear-gradient(135deg, #3d1a08, #78350f); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <p style="color: #f97316; font-size: 32px; margin: 0;">🔥</p>
    <p style="color: white; font-size: 20px; font-weight: bold; margin: 8px 0 0;">${braai.title}</p>
  </div>

  <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
    ${isAttending ? `${attendeeName} is coming!` : `${attendeeName} can't make it`}
  </p>

  <p style="color: #57534e; margin-bottom: 24px;">
    ${isAttending
      ? `You now have <strong>${totalAttending} ${totalAttending === 1 ? 'person' : 'people'}</strong> attending.`
      : `They've let you know they won't be able to make it.`
    }
  </p>

  <a href="${manageUrl}"
     style="display: inline-block; background: #ea580c; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px;">
    View your braai →
  </a>

  <p style="color: #a8a29e; font-size: 12px; margin-top: 32px;">
    You're receiving this because you organised a braai on <a href="${APP_URL}" style="color: #a8a29e;">Kom Braai</a>.
  </p>

</body>
</html>`

  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject,
    html,
  }).catch((err) => {
    console.error('[email-service] sendRsvpNotification failed:', err)
  })
}
