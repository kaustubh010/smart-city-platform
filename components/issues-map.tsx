'use client'

import { useEffect, useRef } from 'react'

interface Issue {
  id: string
  title: string
  category: string
  location: string | null
  latitude: number | null
  longitude: number | null
  status: string
  upvotes: number
}

interface IssuesMapProps {
  issues: Issue[]
}

const CATEGORY_COLORS: Record<string, string> = {
  pothole: '#ef4444',
  lighting: '#f59e0b',
  drainage: '#3b82f6',
  sidewalk: '#8b5cf6',
  traffic_sign: '#f97316',
  graffiti: '#ec4899',
  tree: '#22c55e',
  other: '#6b7280',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  pothole: '🕳️',
  lighting: '💡',
  drainage: '💧',
  sidewalk: '🚶',
  traffic_sign: '🛑',
  graffiti: '🎨',
  tree: '🌳',
  other: '📋',
}

export function IssuesMap({ issues }: IssuesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Filter issues with valid coordinates
      const issuesWithCoords = issues.filter(
        (i) => i.latitude != null && i.longitude != null
      )

      // Determine map center
      let center: [number, number] = [20.5937, 78.9629] // India center fallback
      let zoom = 5

      if (issuesWithCoords.length > 0) {
        const lats = issuesWithCoords.map((i) => i.latitude!)
        const lngs = issuesWithCoords.map((i) => i.longitude!)
        center = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2,
        ]
        zoom = issuesWithCoords.length === 1 ? 14 : 10
      }

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add markers for each issue
      issuesWithCoords.forEach((issue) => {
        const color = CATEGORY_COLORS[issue.category] || '#6b7280'
        const emoji = CATEGORY_EMOJIS[issue.category] || '📋'

        // Create custom colored marker
        const markerIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              background: ${color};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">${emoji}</span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        const statusLabel =
          issue.status === 'open'
            ? '<span style="color:#22c55e;font-weight:600;">● Open</span>'
            : issue.status === 'in_progress'
            ? '<span style="color:#f59e0b;font-weight:600;">● In Progress</span>'
            : '<span style="color:#6b7280;font-weight:600;">● Resolved</span>'

        const popup = L.popup({
          maxWidth: 260,
          className: 'custom-popup',
        }).setContent(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #111;">${issue.title}</div>
            <div style="font-size: 12px; color: #555; margin-bottom: 4px; text-transform: capitalize;">
              ${emoji} ${issue.category.replace('_', ' ')}
            </div>
            ${issue.location ? `<div style="font-size: 11px; color: #777; margin-bottom: 4px;">📍 ${issue.location}</div>` : ''}
            <div style="font-size: 11px; margin-bottom: 8px;">${statusLabel}</div>
            <div style="font-size: 11px; color: #555; margin-bottom: 8px;">👍 ${issue.upvotes || 0} upvotes</div>
            <a href="/issues/${issue.id}" style="
              display: block;
              text-align: center;
              background: #2563eb;
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 12px;
              font-weight: 600;
            ">View Details →</a>
          </div>
        `)

        L.marker([issue.latitude!, issue.longitude!], { icon: markerIcon })
          .bindPopup(popup)
          .addTo(map)
      })

      // Fit bounds if multiple markers
      if (issuesWithCoords.length > 1) {
        const bounds = L.latLngBounds(
          issuesWithCoords.map((i) => [i.latitude!, i.longitude!])
        )
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [issues])

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" />
      {issues.filter((i) => i.latitude && i.longitude).length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 z-10">
          <div className="text-5xl mb-4">📍</div>
          <p className="text-muted-foreground text-center max-w-xs">
            No issues with location data yet. Report an issue with coordinates to see it on the map.
          </p>
        </div>
      )}
    </div>
  )
}
