import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { LoginForm } from '@/components/common/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const { redirectTo } = await searchParams

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
          Kom Braai
        </Link>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Flame className="h-7 w-7 text-orange-500" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-tight">Kom Braai</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to create and manage your braais
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  )
}
