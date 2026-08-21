'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PhotoPin } from '@/components/map/photo-pin'
import { PhotoLightbox } from '@/components/map/photo-lightbox'
import { StopPreviewCard } from '@/components/map/stop-preview-card'
import { cameraForStops, mappableStops, routeFeatures, stopColors } from '@/lib/map-geo'
import { COLORS } from '@/lib/shared/tokens'
import { BRAND_MAP_STYLE } from '@/lib/shared/map-style'
import type { SharePhoto, ShareStop } from '@/lib/share'

// Bản đồ tương tác của trang chia sẻ. Dùng THẲNG style object cream/brand của
// app (`BRAND_MAP_STYLE`) — GL JS nhận style dạng object nên hơn 500 dòng style
// bên app dùng lại được nguyên xi, không cần Mapbox Studio.
//
// LƯU Ý: đừng đưa `BRAND_MAP_STYLE_JSON` (chuỗi stringify mà @rnmapbox/maps cần)
// vào đây — GL JS coi chuỗi là URL và sẽ ra map trắng.

type MapStop = ShareStop & { lat: number; lng: number }

const MIN_ZOOM = 2
const MAX_ZOOM = 17

export default function ShareMapGL({
  stops,
  photos,
  blurLocation,
}: {
  stops: ShareStop[]
  photos: SharePhoto[]
  blurLocation: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const points = useMemo(() => mappableStops(stops) as MapStop[], [stops])
  const colors = useMemo(() => stopColors(points), [points])
  const routes = useMemo(() => routeFeatures(points), [points])
  const photosOf = useMemo(() => {
    const m = new Map<string, SharePhoto[]>()
    for (const p of photos) {
      const arr = m.get(p.stopId) ?? []
      arr.push(p)
      m.set(p.stopId, arr)
    }
    return m
  }, [photos])

  // Mỗi pin cần một node DOM riêng để mapboxgl.Marker neo vào; React vẽ nội dung
  // qua portal nên pin vẫn phản ứng với state (đang chọn, đổi màu) như component
  // bình thường.
  const [pinNodes, setPinNodes] = useState<Map<string, HTMLElement>>(new Map())

  // Dựng map MỘT lần. Camera tính bằng cameraForStops — cùng công thức fit "cụm
  // chính" của app nên khung mở ra giống hệt màn Journal.
  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    mapboxgl.accessToken = token

    const pose = cameraForStops(points, el.clientWidth || 720, el.clientHeight || 420, {
      padding: 56,
      maxZoom: 13,
    })

    const map = new mapboxgl.Map({
      container: el,
      style: BRAND_MAP_STYLE as unknown as mapboxgl.StyleSpecification,
      center: pose?.center ?? [107.5, 16.0],
      zoom: pose?.zoom ?? 5,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    // Chạm nền map (không trúng pin) = đóng card, giống app.
    map.on('click', () => setSelectedId(null))
    map.on('load', () => setReady(true))
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [points])

  // Đường nối: bóng ink lệch xuống-phải rồi thân màu hành trình — cùng paint spec
  // với `SharedMap.tsx` bên app, chỉ đổi camelCase sang kebab-case. line-cap và
  // line-join là thuộc tính LAYOUT bên GL JS, không nằm trong paint.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const data = routes as unknown as mapboxgl.GeoJSONSourceSpecification['data']

    const src = map.getSource('share-routes') as mapboxgl.GeoJSONSource | undefined
    if (src) {
      src.setData(data)
      return
    }
    if (!routes.features.length) return

    map.addSource('share-routes', { type: 'geojson', data })
    map.addLayer({
      id: 'share-route-shadow',
      type: 'line',
      source: 'share-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': COLORS.ink,
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 4, 14, 9],
        'line-opacity': 0.22,
        'line-translate': [2, 3],
        'line-translate-anchor': 'viewport',
      },
    })
    map.addLayer({
      id: 'share-route-line',
      type: 'line',
      source: 'share-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 3, 14, 7],
        'line-opacity': 0.95,
      },
    })
  }, [ready, routes])

  // Gắn/gỡ marker theo danh sách stop. Node DOM giữ trong state để portal bám
  // được; marker tự huỷ khi stop biến mất.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const markers: mapboxgl.Marker[] = []
    const nodes = new Map<string, HTMLElement>()

    for (const s of points) {
      const el = document.createElement('div')
      el.className = 'pin-anchor'
      nodes.set(s.id, el)
      markers.push(
        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([s.lng, s.lat])
          .addTo(map),
      )
    }
    setPinNodes(nodes)

    return () => {
      for (const m of markers) m.remove()
      setPinNodes(new Map())
    }
  }, [points, ready])

  const selected = points.find((s) => s.id === selectedId) ?? null
  const selectedPhotos = selected ? (photosOf.get(selected.id) ?? []) : []

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map-gl" />
      {blurLocation && <span className="map-blur-note">Vị trí đã được làm mờ</span>}

      {points.map((s) => {
        const node = pinNodes.get(s.id)
        if (!node) return null
        const stopPhotos = photosOf.get(s.id) ?? []
        return createPortal(
          <PhotoPin
            name={s.name}
            cover={stopPhotos[0]}
            photoCount={stopPhotos.length}
            color={colors.get(s.id) ?? COLORS.brand}
            selected={s.id === selectedId}
            onSelect={() => setSelectedId(s.id)}
          />,
          node,
          s.id,
        )
      })}

      {selected && (
        <StopPreviewCard
          stop={selected}
          cover={selectedPhotos[0]}
          photoCount={selectedPhotos.length}
          color={colors.get(selected.id) ?? COLORS.brand}
          onViewPhotos={() => setLightbox(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {lightbox && (
        <PhotoLightbox
          photos={photosOf.get(lightbox) ?? []}
          startIndex={0}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
