export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'cold'
  | 'windy'
  | 'unknown'

export const WEATHER_EMOJIS: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  cold: '🥶',
  windy: '💨',
  unknown: '🔥',
}

/** Max days ahead Open-Meteo free forecast supports */
const OPEN_METEO_MAX_DAYS = 16

export type WeatherData = {
  condition: WeatherCondition
  temperatureCelsius: number | null
  description: string
}

// Open-Meteo WMO weather interpretation codes
// https://open-meteo.com/en/docs
function interpretWmoCode(code: number): WeatherCondition {
  if (code === 0 || code === 1) return 'sunny'      // Clear / mainly clear
  if (code === 2 || code === 3) return 'cloudy'     // Partly / overcast
  if (code >= 51 && code <= 67) return 'rainy'      // Drizzle / rain
  if (code >= 71 && code <= 77) return 'cold'       // Snow
  if (code >= 80 && code <= 82) return 'rainy'      // Rain showers
  if (code >= 95) return 'rainy'                    // Thunderstorm
  return 'cloudy'
}

const CONDITION_DESCRIPTIONS: Record<WeatherCondition, string> = {
  sunny: 'Perfect braai weather ☀️',
  cloudy: 'Mild and overcast — still great for a braai',
  rainy: 'Might need a shelter — have a plan B',
  cold: 'Bundle up — it\'s a winter braai 🧣',
  windy: 'Windy conditions — watch the flames',
  unknown: 'Weather unknown — braai anyway 🔥',
}

/**
 * Fetches the weather forecast for a given date and location from Open-Meteo.
 * Responses are cached for 3 hours via Next.js fetch cache.
 */
export async function getWeatherForEvent(
  lat: number,
  lng: number,
  date: string // ISO date string YYYY-MM-DD
): Promise<WeatherData> {
  // Only forecast up to OPEN_METEO_MAX_DAYS days ahead
  const daysUntilEvent = Math.round(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (daysUntilEvent > OPEN_METEO_MAX_DAYS) {
    return {
      condition: 'unknown',
      temperatureCelsius: null,
      description: 'Too soon to forecast — check closer to the date',
    }
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lng))
    url.searchParams.set('daily', 'weather_code,temperature_2m_max,wind_speed_10m_max')
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('start_date', date)
    url.searchParams.set('end_date', date)
    // Note: do NOT set forecast_days when using start_date/end_date — they conflict

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 3 }, // cache 3 hours
    })

    if (!response.ok) {
      return { condition: 'unknown', temperatureCelsius: null, description: CONDITION_DESCRIPTIONS.unknown }
    }

    const data = await response.json() as {
      daily: {
        weather_code: number[]
        temperature_2m_max: number[]
        wind_speed_10m_max: number[]
      }
    }

    const weatherCode = data.daily.weather_code[0]
    const temp = data.daily.temperature_2m_max[0] ?? null
    const windSpeed = data.daily.wind_speed_10m_max[0] ?? 0

    let condition = interpretWmoCode(weatherCode)

    // Override to cold if below 10°C regardless of sky condition
    if (temp !== null && temp < 10) condition = 'cold'
    // Override to windy if wind > 40 km/h and not already rainy/cold
    if (windSpeed > 40 && condition !== 'rainy' && condition !== 'cold') condition = 'windy'

    return {
      condition,
      temperatureCelsius: temp !== null ? Math.round(temp) : null,
      description: CONDITION_DESCRIPTIONS[condition],
    }
  } catch {
    return { condition: 'unknown', temperatureCelsius: null, description: CONDITION_DESCRIPTIONS.unknown }
  }
}
