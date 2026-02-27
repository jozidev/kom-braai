type WeatherBackgroundProps = {
  children: React.ReactNode
}

export function WeatherBackground({ children }: WeatherBackgroundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 via-amber-400 to-yellow-200">
      {children}
    </div>
  )
}

