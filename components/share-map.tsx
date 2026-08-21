'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { mappableStops, routeFeatures, stopColors } from '@/lib/map-geo'
import type { SharePhoto, ShareStop } from '@/lib/share'

// Bản đồ tương tác nặng ~230KB nên chỉ tải khi người xem thực sự mở tab "Bản đồ"
// — lần tải trang đầu (tab Nhật ký) không đụng tới mapbox-gl.
const ShareMapGL = dynamic(() => import('@/components/share-map-gl'), {
  ssr: false,
  loading: () => <div className="map-skeleton" />,
})

// Nhánh ảnh TĨNH (Mapbox Static Images API) giữ lại cho máy không chạy được
// WebGL — in-app browser của Zalo/Messenger trên máy cũ là môi trường thật, thà
// nuôi hai nhánh còn hơn để người xem nhìn một khung trắng.
//
// Static Images API chỉ nhận style thuộc một tài khoản, không nhận style JSON
// rời, nên nhánh này dùng style chuẩn của Mapbox chứ không phải style cream của
// app. Muốn khớp màu thì tạo style trên Studio rồi điền
// NEXT_PUBLIC_MAPBOX_STATIC_STYLE.
const DEFAULT_STYLE = 'mapbox/light-v11'
const WIDTH = 720
const HEIGHT = 420

/** GeoJSON overlay theo simplestyle-spec — Static API tự vẽ đường và pin. */
function overlayFor(stops: ShareStop[]) {
  const points = mappableStops(stops)
  const colors = stopColors(points)
  const features: unknown[] = routeFeatures(points).features.map((f) => ({
    ...f,
    properties: { stroke: f.properties.color, 'stroke-width': 4, 'stroke-opacity': 0.9 },
  }))
  for (const s of points) {
    features.push({
      type: 'Feature',
      properties: {
        'marker-color': colors.get(s.id) ?? '#82be57',
        'marker-size': 'medium',
      },
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    })
  }
  return { type: 'FeatureCollection', features }
}

/**
 * WebGL2 có chạy được không. mapbox-gl v3 đã bỏ `mapboxgl.supported()`, và dù
 * còn thì gọi nó cũng kéo luôn cả thư viện vào bundle — thứ mà nhánh fallback cố
 * tránh. Thử tạo một context rồi bỏ là đủ.
 */
function hasWebgl() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

export function ShareMap({
  stops,
  photos,
  blurLocation,
}: {
  stops: ShareStop[]
  photos: SharePhoto[]
  blurLocation: boolean
}) {
  // null = chưa biết (chưa mount). Quyết định sau khi mount để server và client
  // render ra cùng một thứ, không vênh hydration.
  const [webgl, setWebgl] = useState<boolean | null>(null)
  useEffect(() => setWebgl(hasWebgl()), [])

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const points = mappableStops(stops)

  if (points.length === 0) {
    return <div className="map-missing">Bộ sưu tập này chưa có kỷ niệm nào gắn vị trí.</div>
  }
  if (!token) {
    return (
      <div className="map-missing">
        Bản đồ chưa sẵn sàng — trang này thiếu <code>NEXT_PUBLIC_MAPBOX_TOKEN</code>.
      </div>
    )
  }

  if (webgl === null) return <div className="map-skeleton" />
  if (webgl) return <ShareMapGL stops={stops} photos={photos} blurLocation={blurLocation} />

  const style = process.env.NEXT_PUBLIC_MAPBOX_STATIC_STYLE || DEFAULT_STYLE
  const overlay = encodeURIComponent(JSON.stringify(overlayFor(stops)))
  // `auto` fit khung theo overlay; padding chừa chỗ cho pin sát mép khỏi bị cắt.
  const src =
    `https://api.mapbox.com/styles/v1/${style}/static/geojson(${overlay})` +
    `/auto/${WIDTH}x${HEIGHT}@2x?padding=56&access_token=${token}`

  return (
    <div className="map-wrap">
      <img className="map-static" src={src} alt={`Bản đồ ${points.length} địa điểm`} />
      {blurLocation && <span className="map-blur-note">Vị trí đã được làm mờ</span>}
      <p className="map-hint">
        Trình duyệt này chưa chạy được bản đồ tương tác — mở trong Safari hoặc Chrome để
        kéo, phóng to và chỉ đường tới từng nơi.
      </p>
    </div>
  )
}
