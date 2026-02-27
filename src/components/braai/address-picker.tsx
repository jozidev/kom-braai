'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

type AddressPickerProps = {
  defaultVenueName?: string
  defaultAddress?: string
  defaultLat?: number
  defaultLng?: number
}

type PlaceResult = {
  venueName: string
  address: string
  lat: number
  lng: number
}

declare global {
  interface Window {
    initGoogleMaps?: () => void
    google?: {
      maps?: {
        places?: unknown
      }
    }
  }
}

// Module-level singleton — ensures the Maps script is only ever injected once
// regardless of how many AddressPicker instances are mounted.
let mapsLoadPromise: Promise<void> | null = null

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise

  if (window.google?.maps?.places) {
    mapsLoadPromise = Promise.resolve()
    return mapsLoadPromise
  }

  mapsLoadPromise = new Promise((resolve) => {
    window.initGoogleMaps = () => {
      delete window.initGoogleMaps
      resolve()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })

  return mapsLoadPromise
}

export function AddressPicker({
  defaultVenueName = '',
  defaultAddress = '',
  defaultLat,
  defaultLng,
}: AddressPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [place, setPlace] = useState<PlaceResult | null>(
    defaultAddress
      ? {
          venueName: defaultVenueName,
          address: defaultAddress,
          lat: defaultLat ?? 0,
          lng: defaultLng ?? 0,
        }
      : null
  )
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [venueNameInput, setVenueNameInput] = useState(defaultVenueName)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    loadGoogleMapsScript(apiKey).then(() => setMapsLoaded(true))
  }, [])

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current) return

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { types: ['geocode', 'establishment'] }
    )

    autocomplete.addListener('place_changed', () => {
      const selected = autocomplete.getPlace()
      if (!selected.geometry?.location) return

      const result: PlaceResult = {
        venueName: venueNameInput || selected.name || '',
        address: selected.formatted_address ?? '',
        lat: selected.geometry.location.lat(),
        lng: selected.geometry.location.lng(),
      }

      setPlace(result)
    })
  }, [mapsLoaded, venueNameInput])

  return (
    <div className="space-y-3">
      {/* Venue name */}
      <div className="space-y-1.5">
        <label htmlFor="venue_name" className="text-sm font-medium">
          Venue name
        </label>
        <Input
          id="venue_name"
          name="venue_name"
          value={venueNameInput}
          onChange={(e) => setVenueNameInput(e.target.value)}
          placeholder="e.g. Jaco's place, Sunridge Park"
          required
        />
      </div>

      {/* Address / autocomplete */}
      <div className="space-y-1.5">
        <label htmlFor="venue_address_input" className="text-sm font-medium">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            id="venue_address_input"
            defaultValue={defaultAddress}
            placeholder={
              mapsLoaded
                ? 'Start typing an address...'
                : 'Enter the full address'
            }
            className="pl-9"
            // Not named — value flows through hidden inputs below
            onChange={
              !mapsLoaded
                ? (e) =>
                    setPlace((prev) => ({
                      ...(prev ?? { venueName: venueNameInput, lat: 0, lng: 0 }),
                      address: e.target.value,
                    }))
                : undefined
            }
          />
        </div>
      </div>

      {/* Hidden inputs carrying the real form values */}
      <input type="hidden" name="venue_address" value={place?.address ?? ''} />
      <input
        type="hidden"
        name="venue_lat"
        value={place?.lat != null ? String(place.lat) : ''}
      />
      <input
        type="hidden"
        name="venue_lng"
        value={place?.lng != null ? String(place.lng) : ''}
      />

      {/* Confirmation chip */}
      {place?.address && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {place.address}
        </p>
      )}
    </div>
  )
}
