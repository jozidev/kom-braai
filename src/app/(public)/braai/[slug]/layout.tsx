import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export default function BraaiInviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={nunito.className}>
      {children}
    </div>
  )
}
