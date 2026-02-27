import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 to-amber-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <p className="text-7xl" aria-hidden="true">🪣</p>
        <h1 className="text-3xl font-extrabold text-white">
          Nothing here
        </h1>
        <p className="text-white/70">
          This page doesn&apos;t exist. The braai you&apos;re looking for may have moved or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-white text-orange-900 hover:bg-white/90 font-bold">
              Back to home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white">
              My braais
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
