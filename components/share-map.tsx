'use client'

import { useEffect, useMemo, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BRAND_MAP_STYLE, MAPBOX_STYLE_URL } from '@/lib/map-style'
import { boundsOf, mappableStops, routeFeatures, stopColors } from '@/lib/map-geo'
import type { SharePhoto, ShareStop } from '@/lib/share'

const VN_CENTER: [number, number] = [108.2, 16.0]
const MAX_ZOOM = 15.5

/**
 * Bản đồ read-only của một bộ sưu tập: pin ảnh từng lần ghé + đường nối theo
 * hành trình. Bản web của `src/components/map/SharedMap.tsx`.
 *
 * Marker dựng bằng DOM element chứ không phải symbol layer: pin là ảnh tròn
 * viền trắng kèm nhãn tên, thứ mà layer GL không vẽ được nếu không nạp trước
 * từng ảnh thành sprite.
 */
export function ShareMap({ stops, photos }: { stops: ShareStop[]; photos: SharePhoto[] }) {
  const container = useRef<HTMLDivElement>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Gói sẵn mọi thứ bản đồ cần thành một giá trị ổn định — effect dựng map là
  // thao tác nặng, không được chạy lại chỉ vì props đổi tham chiếu.
  const pins = useMemo(() => {
    const points = mappableStops(stops)
    const colors = stopColors(points)
    return points.map((s) => {
      const own = photos.filter((p) => p.stopId === s.id)
      const cover = own.find((p) => p.id === s.coverPhotoId) ?? own[0]
      return {
        id: s.id,
        name: s.name,
        lng: s.lng,
        lat: s.lat,
        color: colors.get(s.id) ?? '#82be57',
        cover: cover?.thumbUrl || cover?.url || '',
        count: own.length,
      }
    })
  }, [stops, photos])

  const routes = useMemo(() => routeFeatures(mappableStops(stops)), [stops])
  const bounds = useMemo(() => boundsOf(mappableStops(stops)), [stops])

  useEffect(() => {
    if (!container.current || !token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: container.current,
      style: MAPBOX_STYLE_URL ?? BRAND_MAP_STYLE,
      center: pins[0] ? [pins[0].lng, pins[0].lat] : VN_CENTER,
      zoom: pins.length > 0 ? 11 : 4,
      maxZoom: MAX_ZOOM,
      // Trang cuộn dọc là chính — cuộn chuột trên map mà map ăn mất thì người
      // xem kẹt lại giữa trang. Ctrl/hai ngón mới zoom.
      cooperativeGestures: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      if (routes.features.length > 0) {
        map.addSource('routes', { type: 'geojson', data: routes })
        map.addLayer({
          id: 'routes',
          type: 'line',
          source: 'routes',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 3,
            'line-opacity': 0.85,
            'line-dasharray': [2, 1.4],
          },
        })
      }

      for (const pin of pins) {
        const el = document.createElement('div')
        el.className = 'map-pin'
        el.style.setProperty('--pin-color', pin.color)
        el.innerHTML = `
          <div class="map-pin-photo">
            ${pin.cover ? `<img src="${pin.cover}" alt="" />` : ''}
            ${pin.count > 1 ? `<span class="map-pin-badge">+${pin.count - 1}</span>` : ''}
          </div>
          <span class="map-pin-label"></span>
        `
        // Tên địa điểm do người dùng đặt — gán qua textContent để không có
        // đường nào biến nó thành HTML.
        const label = el.querySelector('.map-pin-label')
        if (label) label.textContent = pin.name

        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map)
      }

      if (bounds && pins.length > 1) {
        map.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 0 })
      }
    })

    return () => map.remove()
  }, [token, pins, routes, bounds])

  if (!token) {
    return (
      <div className="map-missing">
        Bản đồ chưa sẵn sàng — trang này thiếu <code>NEXT_PUBLIC_MAPBOX_TOKEN</code>.
      </div>
    )
  }

  if (pins.length === 0) {
    return <div className="map-missing">Bộ sưu tập này chưa có kỷ niệm nào gắn vị trí.</div>
  }

  return <div ref={container} className="map-canvas" />
}
