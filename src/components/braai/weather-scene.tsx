import { Flame, Sun, Cloud, CloudRain, Snowflake, Wind, CircleHelp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WeatherCondition } from '@/lib/services/weather-service'

const WEATHER_ICONS: Record<WeatherCondition, LucideIcon> = {
  sunny:   Sun,
  cloudy:  Cloud,
  rainy:   CloudRain,
  cold:    Snowflake,
  windy:   Wind,
  unknown: CircleHelp,
}

type SceneTheme = {
  sky:          [string, string, string]
  hills:        [string, string, string]
  element:      'sun' | 'moon' | 'clouds' | 'rain' | null
  elementColor: string
  glowColor:    string
}

const THEMES: Record<WeatherCondition, SceneTheme> = {
  sunny: {
    sky:          ['#92250C', '#E05008', '#FAD84A'],
    hills:        ['#5C2A0C', '#311206', '#1A0800'],
    element:      'sun',
    elementColor: '#FCD34D',
    glowColor:    '#F97316',
  },
  cloudy: {
    sky:          ['#302C28', '#615A52', '#B5ABA2'],
    hills:        ['#1C1714', '#0E0C09', '#060402'],
    element:      'clouds',
    elementColor: '#E7E5E4',
    glowColor:    '#A8A29E',
  },
  rainy: {
    sky:          ['#0A1020', '#1E3A5F', '#3D6585'],
    hills:        ['#111C2B', '#08101A', '#040810'],
    element:      'rain',
    elementColor: '#475569',
    glowColor:    '#334155',
  },
  cold: {
    sky:          ['#050B1F', '#0F2460', '#4A8FCC'],
    hills:        ['#0A1428', '#05091C', '#020610'],
    element:      'moon',
    elementColor: '#E0F2FE',
    glowColor:    '#BAE6FD',
  },
  windy: {
    sky:          ['#011510', '#033825', '#0D6B47'],
    hills:        ['#010C07', '#000804', '#000403'],
    element:      null,
    elementColor: '',
    glowColor:    '',
  },
  unknown: {
    sky:          ['#100200', '#520A02', '#BA3205'],
    hills:        ['#1E0600', '#0C0200', '#060100'],
    element:      'sun',
    elementColor: '#FB923C',
    glowColor:    '#DC2626',
  },
}

// Hill paths in viewBox 0 0 480 200
// Back hill — has a subtle kopjie bump around x=310
const HILL_BACK  = 'M0,112 C30,105 65,100 110,102 C145,104 160,94 182,90 C204,86 226,90 260,98 C295,106 360,102 430,104 L480,105 L480,200 L0,200 Z'
const HILL_MID   = 'M0,138 C45,128 105,122 170,126 C240,130 310,122 385,127 C430,130 460,127 480,126 L480,200 L0,200 Z'
const HILL_FRONT = 'M0,162 C60,152 130,147 210,152 C290,157 370,148 450,154 C464,155 474,153 480,152 L480,200 L0,200 Z'

// Rain streak x positions
const RAIN_X = [24, 56, 88, 120, 152, 184, 216, 248, 280, 312, 344, 376, 408, 440]

type WeatherSceneProps = {
  condition: WeatherCondition
  title: string
  weatherDescription: string
  temperatureCelsius: number | null
}

export function WeatherScene({ condition, title, weatherDescription, temperatureCelsius }: WeatherSceneProps) {
  const s = THEMES[condition]
  const hasSun  = s.element === 'sun'
  const hasMoon = s.element === 'moon'
  const uid = condition // stable — safe to use as gradient id suffix
  const WeatherIcon = WEATHER_ICONS[condition]

  return (
    <div className="relative overflow-hidden rounded-t-2xl" style={{ height: 200 }}>
      <svg
        viewBox="0 0 480 200"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={s.sky[0]} />
            <stop offset="55%"  stopColor={s.sky[1]} />
            <stop offset="100%" stopColor={s.sky[2]} />
          </linearGradient>

          {(hasSun || hasMoon) && (
            <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={s.elementColor} stopOpacity={hasSun ? '0.9' : '0.5'} />
              <stop offset="55%"  stopColor={s.glowColor}    stopOpacity={hasSun ? '0.35' : '0.1'} />
              <stop offset="100%" stopColor={s.glowColor}    stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {/* Sky */}
        <rect width="480" height="200" fill={`url(#sky-${uid})`} />

        {/* Sun */}
        {hasSun && (
          <>
            <circle cx="370" cy="62" r="58"  fill={`url(#glow-${uid})`} />
            <circle cx="370" cy="62" r="22"  fill={s.elementColor} opacity="0.92" />
          </>
        )}

        {/* Crescent moon */}
        {hasMoon && (
          <>
            <circle cx="385" cy="48" r="40"  fill={`url(#glow-${uid})`} />
            <circle cx="385" cy="48" r="18"  fill={s.elementColor} opacity="0.88" />
            <circle cx="393" cy="44" r="14"  fill={s.sky[0]} opacity="0.85" />
          </>
        )}

        {/* Fluffy clouds */}
        {s.element === 'clouds' && (
          <g opacity="0.65">
            <ellipse cx="88"  cy="52" rx="42" ry="16" fill={s.elementColor} />
            <ellipse cx="112" cy="43" rx="32" ry="14" fill={s.glowColor} />
            <ellipse cx="144" cy="54" rx="38" ry="14" fill={s.elementColor} />
            <ellipse cx="295" cy="42" rx="38" ry="14" fill={s.glowColor} />
            <ellipse cx="328" cy="33" rx="30" ry="12" fill={s.elementColor} />
            <ellipse cx="364" cy="44" rx="40" ry="15" fill={s.glowColor} />
          </g>
        )}

        {/* Rain clouds + streaks */}
        {s.element === 'rain' && (
          <>
            <g opacity="0.80">
              <ellipse cx="76"  cy="42" rx="48" ry="18" fill={s.elementColor} />
              <ellipse cx="108" cy="32" rx="38" ry="16" fill="#374151" />
              <ellipse cx="152" cy="44" rx="44" ry="16" fill={s.elementColor} />
              <ellipse cx="290" cy="34" rx="44" ry="16" fill="#374151" />
              <ellipse cx="330" cy="24" rx="34" ry="14" fill={s.elementColor} />
              <ellipse cx="376" cy="37" rx="46" ry="17" fill="#374151" />
            </g>
            <g stroke="#93C5FD" strokeWidth="1.2" opacity="0.22">
              {RAIN_X.map((x, i) => (
                <line
                  key={i}
                  x1={x + (i % 3) * 6}  y1={68  + (i % 4) * 14}
                  x2={x + (i % 3) * 6 - 10} y2={96  + (i % 4) * 14}
                />
              ))}
            </g>
          </>
        )}

        {/* Hills — back to front */}
        <path d={HILL_BACK}  fill={s.hills[0]} />

        {/* Acacia trees on back hill */}
        <g fill={s.hills[0]}>
          <rect    x="62"   y="96"  width="2" height="16" />
          <ellipse cx="63"  cy="92" rx="13"   ry="5" />
          <rect    x="276"  y="96"  width="2" height="16" />
          <ellipse cx="277" cy="92" rx="12"   ry="4.5" />
          <rect    x="400"  y="99"  width="2" height="15" />
          <ellipse cx="401" cy="95" rx="12"   ry="4.5" />
        </g>

        <path d={HILL_MID}   fill={s.hills[1]} />

        {/* Acacia on mid hill */}
        <g fill={s.hills[1]}>
          <rect    x="148"  y="120" width="2" height="18" />
          <ellipse cx="149" cy="116" rx="15"  ry="5.5" />
        </g>

        <path d={HILL_FRONT} fill={s.hills[2]} />
      </svg>

      {/* Title overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
        <Flame className="h-10 w-10 text-white drop-shadow-lg" aria-hidden="true" />
        <h1
          className="text-center text-3xl font-extrabold tracking-tight text-white leading-tight"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {title}
        </h1>
      </div>

      {/* Weather badge — bottom-left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/30 backdrop-blur-sm px-3 py-2">
        <WeatherIcon className="h-4 w-4 text-white/80 flex-shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-white/70 text-xs leading-none">{weatherDescription}</p>
          {temperatureCelsius !== null && (
            <p className="text-white font-bold text-sm leading-none">{temperatureCelsius}°C</p>
          )}
        </div>
      </div>
    </div>
  )
}
