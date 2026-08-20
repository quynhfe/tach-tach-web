import type { ShareStop } from '@/lib/share'

// ---------------------------------------------------------------------------
// Hình học bản đồ cho trang chia sẻ. Bản rút gọn của `src/lib/mapGeo.ts` bên
// app: giữ đúng luật gom "hành trình" và bảng màu để pin/đường trên web trùng
// màu với app, bỏ phần app-only (snap đường thật, nét vẽ tay, tua vùng).
// ---------------------------------------------------------------------------

export const PLACE_COLORS = ['#82be57', '#f08fb2', '#80b4ee', '#c4a0ee', '#f1be82', '#f7c84b']

export type LngLat = [number, number]

/** Toạ độ [0, 0] là "chưa có vị trí" chứ không phải giữa Đại Tây Dương. */
const hasCoords = (s: ShareStop & { lat?: number; lng?: number }) =>
  typeof s.lat === 'number' && typeof s.lng === 'number' && (s.lat !== 0 || s.lng !== 0)

export type MapStop = ShareStop & { lat: number; lng: number }

export function mappableStops(stops: ShareStop[]): MapStop[] {
  return stops.filter((s) => hasCoords(s as MapStop)) as MapStop[]
}

// Cùng khoá gom với app: stop trong một chuyến là một hành trình; kỷ niệm lẻ
// gom theo (vùng, ngày) để một ngày lang thang cùng tỉnh vẫn có màu và đường.
const journeyKey = (s: MapStop & { tripId?: string | null }) =>
  s.tripId ? s.tripId : `solo:${s.region}:${s.arrivedAt.slice(0, 10)}`

export type Journey = { id: string; color: string; stops: MapStop[] }

/** Gom stop thành hành trình + gán màu ổn định (sắp theo mốc sớm nhất). */
export function groupJourneys(stops: MapStop[]): Journey[] {
  const map = new Map<string, MapStop[]>()
  for (const s of stops) {
    const k = journeyKey(s)
    const arr = map.get(k) ?? []
    arr.push(s)
    map.set(k, arr)
  }
  const groups = [...map.entries()]
    .map(([id, gs]) => ({
      id,
      stops: [...gs].sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt)),
    }))
    .sort((a, b) => a.stops[0].arrivedAt.localeCompare(b.stops[0].arrivedAt))
  return groups.map((g, i) => ({ ...g, color: PLACE_COLORS[i % PLACE_COLORS.length] }))
}

export function stopColors(stops: MapStop[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const j of groupJourneys(stops)) {
    for (const s of j.stops) m.set(s.id, j.color)
  }
  return m
}

export type RouteCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    properties: { color: string }
    geometry: { type: 'LineString'; coordinates: LngLat[] }
  }[]
}

/** Một đường nối cho mỗi hành trình, theo đúng thứ tự ghé. */
export function routeFeatures(stops: MapStop[]): RouteCollection {
  return {
    type: 'FeatureCollection',
    features: groupJourneys(stops)
      .filter((j) => j.stops.length >= 2)
      .map((j) => ({
        type: 'Feature' as const,
        properties: { color: j.color },
        geometry: {
          type: 'LineString' as const,
          coordinates: j.stops.map((s) => [s.lng, s.lat] as LngLat),
        },
      })),
  }
}

/** Khung bao mọi stop, cho `map.fitBounds`. Null khi không có stop nào có toạ độ. */
export function boundsOf(stops: MapStop[]): [LngLat, LngLat] | null {
  if (stops.length === 0) return null
  let w = Infinity
  let s = Infinity
  let e = -Infinity
  let n = -Infinity
  for (const stop of stops) {
    w = Math.min(w, stop.lng)
    e = Math.max(e, stop.lng)
    s = Math.min(s, stop.lat)
    n = Math.max(n, stop.lat)
  }
  return [
    [w, s],
    [e, n],
  ]
}
