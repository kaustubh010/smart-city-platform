'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', emoji: '🕳️' },
  { value: 'lighting', label: 'Street Lighting', emoji: '💡' },
  { value: 'drainage', label: 'Drainage', emoji: '💧' },
  { value: 'sidewalk', label: 'Sidewalk Damage', emoji: '🚶' },
  { value: 'traffic_sign', label: 'Traffic Sign', emoji: '🛑' },
  { value: 'graffiti', label: 'Graffiti', emoji: '🎨' },
  { value: 'tree', label: 'Tree Damage', emoji: '🌳' },
  { value: 'other', label: 'Other', emoji: '📋' },
]

function MapPicker({
  latitude,
  longitude,
  onLocationSelect,
}: {
  latitude: string
  longitude: string
  onLocationSelect: (lat: number, lng: number) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const initLat = latitude ? parseFloat(latitude) : 20.5937
      const initLng = longitude ? parseFloat(longitude) : 78.9629
      const initZoom = latitude ? 14 : 5

      const map = L.map(mapRef.current!, {
        center: [initLat, initLng],
        zoom: initZoom,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // If coordinates already set, place marker
      if (latitude && longitude) {
        const marker = L.marker([parseFloat(latitude), parseFloat(longitude)], { draggable: true }).addTo(map)
        markerRef.current = marker
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onLocationSelect(pos.lat, pos.lng)
        })
      }

      // Click to place/move marker
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(markerRef.current as any).setLatLng([lat, lng])
        } else {
          const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
          markerRef.current = marker
          marker.on('dragend', () => {
            const pos = marker.getLatLng()
            onLocationSelect(pos.lat, pos.lng)
          })
        }
        onLocationSelect(lat, lng)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker when lat/lng changes externally (geolocation)
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return
    import('leaflet').then((L) => {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapInstanceRef.current as any
      map.setView([lat, lng], 14)
      if (markerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(markerRef.current as any).setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current = marker
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onLocationSelect(pos.lat, pos.lng)
        })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude])

  return (
    <div className="space-y-2">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="w-full h-56 rounded-lg border border-border overflow-hidden"
      />
      <p className="text-xs text-muted-foreground">
        Click on the map to pin the issue location, or drag the marker to adjust.
      </p>
    </div>
  )
}

export function ReportForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    location: '',
    latitude: '',
    longitude: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleLocationClick = async () => {
    if ('geolocation' in navigator) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }))
          setShowMapPicker(true)
          setIsLoading(false)
        },
        () => {
          setError('Unable to access your location. Please pin it on the map.')
          setShowMapPicker(true)
          setIsLoading(false)
        }
      )
    } else {
      setShowMapPicker(true)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        router.push('/auth/login')
        return
      }

      // We'll send the image as base64 in the main request body
      // or we could use FormData. Let's stick to base64 for simplicity
      // since the helper already supports it.

      // Create issue via API
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          image: imagePreview, // Send base64 image data
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to create issue')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/issues')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Issue Reported!</h3>
        <p className="text-muted-foreground mb-6">Redirecting to issues list...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="block mb-2">
          Issue Title *
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Brief title of the issue"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <Label className="block mb-3">Category *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`p-3 rounded-lg border-2 transition-colors text-center ${
                formData.category === cat.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-xs font-medium text-foreground">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="block mb-2">
          Description
        </Label>
        <textarea
          id="description"
          placeholder="Provide details about the issue..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="location" className="block mb-2">
          Location Address
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Street address or landmark"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      {/* Location Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleLocationClick}
          disabled={isLoading}
        >
          📍 Use My Location
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setShowMapPicker((v) => !v)}
        >
          🗺️ {showMapPicker ? 'Hide Map' : 'Pick on Map'}
        </Button>
      </div>

      {/* Map Picker */}
      {showMapPicker && (
        <div className="space-y-2">
          <MapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={(lat, lng) => {
              setFormData((prev) => ({
                ...prev,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
              }))
            }}
          />
        </div>
      )}

      {/* Coordinates display */}
      {(formData.latitude || formData.longitude) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" className="block mb-2">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              placeholder="Latitude"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="block mb-2">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              placeholder="Longitude"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <Label htmlFor="image" className="block mb-2">
          Photo (optional)
        </Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label htmlFor="image" className="cursor-pointer block">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 mx-auto rounded-lg object-cover mb-2"
              />
            ) : (
              <div className="text-2xl mb-2">📷</div>
            )}
            <p className="text-sm text-muted-foreground">
              {image ? image.name : 'Click to upload a photo of the issue'}
            </p>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground font-semibold py-2"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Report'}
      </Button>
    </form>
  )
}
