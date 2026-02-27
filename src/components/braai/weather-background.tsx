import type { WeatherCondition } from '@/lib/services/weather-service'

type WeatherBackgroundProps = {
  condition: WeatherCondition
  children: React.ReactNode
}

const WEATHER_STYLES: Record<WeatherCondition, { bg: string; overlay: string }> = {
  sunny: {
    bg: 'from-amber-400 via-orange-300 to-yellow-200',
    overlay: 'bg-orange-500/10',
  },
  cloudy: {
    bg: 'from-slate-400 via-zinc-300 to-stone-200',
    overlay: 'bg-slate-500/10',
  },
  rainy: {
    bg: 'from-slate-600 via-blue-400 to-slate-300',
    overlay: 'bg-blue-900/20',
  },
  cold: {
    bg: 'from-sky-600 via-blue-300 to-slate-100',
    overlay: 'bg-sky-900/15',
  },
  windy: {
    bg: 'from-teal-400 via-cyan-300 to-sky-200',
    overlay: 'bg-teal-500/10',
  },
  unknown: {
    bg: 'from-orange-500 via-red-400 to-amber-300',
    overlay: 'bg-orange-900/10',
  },
}

export function WeatherBackground({ condition, children }: WeatherBackgroundProps) {
  const styles = WEATHER_STYLES[condition]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.bg}`}>
      <div className={`min-h-screen ${styles.overlay}`}>
        {children}
      </div>
    </div>
  )
}
