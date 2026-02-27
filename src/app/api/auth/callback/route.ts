import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getOrCreateOrganiser } from '@/lib/services/organiser-service'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabaseResponse = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let error: string | null = null

  if (code) {
    // OAuth PKCE flow
    const { error: exchError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchError) error = exchError.message
  } else if (token_hash && type) {
    // Magic link / OTP flow
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash, type })
    if (otpError) error = otpError.message
  } else {
    error = 'no_code'
  }

  if (!error) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await getOrCreateOrganiser(user)
    }
    return supabaseResponse
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
