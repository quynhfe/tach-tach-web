// GENERATED từ tach-bru/src/shared/map-geo.ts — ĐỪNG SỬA FILE NÀY.
// Sửa ở NGUỒN rồi chạy `npm run sync:shared` bên repo app.

// ---------------------------------------------------------------------------
// Hình học bản đồ dùng CHUNG giữa app và web viewer: gom hành trình, gán màu,
// khung bao, camera fit, tuyến nối nét vẽ tay. Nhờ vậy pin và đường trên
// /t/<slug> trùng khít với màn Journal trong app.
//
// File thuần TypeScript — không import react-native, expo-*, next hay alias @/.
// Vì thế nó nhận GeoStop generic thay vì `Stop` của app: app truyền `Stop`, web
// truyền `ShareStop`, cả hai đều là supertype nên không cần cast.
// ---------------------------------------------------------------------------

import { DAY_COLORS, PLACE_COLORS } from './tokens'

export type LngLat = [number, number]

/** Phần tối thiểu của một lần ghé mà mọi phép tính hình học cần. */
export interface GeoStop {
  id: string
  lat: number
  lng: number
  arrivedAt: string
  region: string
  tripId?: string | null
}

/** Bản chưa chắc có toạ độ — web đọc thẳng RPC nên lat/lng có thể null. */
export type MaybeGeoStop = Omit<GeoStop, 'lat' | 'lng'> & {
  lat: number | null
  lng: number | null
}

/** Màu accent theo ngày (1-based), quay vòng bảng DAY_COLORS. */
export const dayColor = (dayIndex: number) =>
  DAY_COLORS[(Math.max(dayIndex, 1) - 1) % DAY_COLORS.length]

/**
 * Toạ độ dùng được cho Mapbox. Lần ghé có thể thiếu toạ độ (ảnh gán vị trí tay mà
 * geocode không trả điểm), và provider vị trí có lúc bắn update rỗng. Cả hai đưa
 * thẳng vào Mapbox là nổ "coordinates must contain numbers" ở JS hoặc
 * "latitude must not be NaN" ở native — chặn ngay tại đây thay vì để nó lan.
 */
export function isLngLat(c: LngLat | null | undefined): c is LngLat {
  return Array.isArray(c) && c.length === 2 && c.every(Number.isFinite)
}

/** Stop có toạ độ dùng được — mọi phép tính hình học phải lọc qua đây trước. */
export const locatedStops = <T extends GeoStop>(stops: T[]): T[] =>
  stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))

/** Lọc stop chưa gán vị trí ra khỏi danh sách vẽ map. Toạ độ [0, 0] tính là
 *  "chưa có vị trí" chứ không phải giữa Đại Tây Dương. */
export function mappableStops<T extends MaybeGeoStop>(
  stops: T[],
): (T & { lat: number; lng: number })[] {
  return stops.filter(
    (s): s is T & { lat: number; lng: number } =>
      typeof s.lat === 'number' &&
      typeof s.lng === 'number' &&
      Number.isFinite(s.lat) &&
      Number.isFinite(s.lng) &&
      (s.lat !== 0 || s.lng !== 0),
  )
}

export interface Bounds {
  ne: LngLat
  sw: LngLat
}

// Span tối thiểu (~5km) để chống khung suy biến khi chỉ 1 stop (hoặc cụm sát nhau):
// ne===sw thì Mapbox zoom kịch trần (thấy mỗi 1 điểm) → nới quanh tâm cho hợp lý.
const MIN_SPAN = 0.05

/** Khung bao mọi stop (để Camera fit lúc mở map). null nếu không có stop. */
export function boundsOf(input: GeoStop[]): Bounds | null {
  const stops = locatedStops(input)
  if (!stops.length) return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const s of stops) {
    minLng = Math.min(minLng, s.lng)
    maxLng = Math.max(maxLng, s.lng)
    minLat = Math.min(minLat, s.lat)
    maxLat = Math.max(maxLat, s.lat)
  }
  // Nới đối xứng quanh tâm khi span quá nhỏ → 1 điểm ra mức zoom cỡ thành phố.
  if (maxLng - minLng < MIN_SPAN) {
    const c = (maxLng + minLng) / 2
    minLng = c - MIN_SPAN / 2
    maxLng = c + MIN_SPAN / 2
  }
  if (maxLat - minLat < MIN_SPAN) {
    const c = (maxLat + minLat) / 2
    minLat = c - MIN_SPAN / 2
    maxLat = c + MIN_SPAN / 2
  }
  return { ne: [maxLng, maxLat], sw: [minLng, minLat] }
}

export interface CameraPose {
  center: LngLat
  zoom: number
}

// Web Mercator: tile gốc 512px; mercY = vĩ độ → toạ độ Mercator chuẩn hoá.
const WORLD_PX = 512
const clampLat = (lat: number) => Math.max(Math.min(lat, 85), -85)
const mercY = (lat: number) => {
  const s = Math.sin((clampLat(lat) * Math.PI) / 180)
  return Math.log((1 + s) / (1 - s)) / 2
}

// Phân vị (0..1) trên mảng ĐÃ sort tăng dần — nội suy tuyến tính giữa 2 mốc.
function quantile(sorted: number[], q: number) {
  if (sorted.length <= 1) return sorted[0] ?? 0
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// Hàng rào Tukey (IQR) cho 1 trục: [Q1 − 1.5·IQR, Q3 + 1.5·IQR]. Điểm ngoài rào
// = "lạc" (outlier).
function axisFence(values: number[]): [number, number] {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  return [q1 - 1.5 * iqr, q3 + 1.5 * iqr]
}

/** "Cụm chính" — bỏ điểm LẠC (outlier IQR) trên lat HOẶC lng. Tự thích nghi:
 *  chỉ 1 thành phố → giữ nguyên (fit chặt); rải cả nước → giữ nguyên (fit rộng);
 *  1 điểm tít xa (vd Sa Pa) → loại khỏi khung fit. <4 điểm thì IQR vô nghĩa, giữ
 *  hết. Trả về ≥1 điểm (rỗng thì trả nguyên bản). */
export function coreStops<T extends GeoStop>(input: T[]): T[] {
  const stops = locatedStops(input)
  if (stops.length < 4) return stops
  const [latLo, latHi] = axisFence(stops.map((s) => s.lat))
  const [lngLo, lngHi] = axisFence(stops.map((s) => s.lng))
  const core = stops.filter(
    (s) => s.lat >= latLo && s.lat <= latHi && s.lng >= lngLo && s.lng <= lngHi,
  )
  return core.length ? core : stops
}

/** center + zoom để KHUNG BAO stops lấp gần đầy viewport (padding nhỏ). Tự tính
 *  thay cho Camera.fitBounds (fitBounds hay tính sai khi map chưa đo được kích
 *  thước → zoom kịch ra). Fit theo CỤM CHÍNH (bỏ điểm lạc) để pin không bị nhỏ
 *  khi có 1 nơi tít xa. width/height = cỡ map (px); maxZoom chặn zoom quá sâu khi
 *  cụm sát/1 điểm. null nếu không có stop. */
export function cameraForStops(
  stops: GeoStop[],
  width: number,
  height: number,
  opts: { padding?: number; maxZoom?: number } = {}
): CameraPose | null {
  const b = boundsOf(coreStops(stops))
  if (!b) return null
  const { padding = 40, maxZoom = 13 } = opts
  const [neLng, neLat] = b.ne
  const [swLng, swLat] = b.sw
  const center: LngLat = [(neLng + swLng) / 2, (neLat + swLat) / 2]

  const latFraction = (mercY(neLat) - mercY(swLat)) / (2 * Math.PI)
  const lngDiff = neLng - swLng
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

  const zoomFor = (frac: number, dimPx: number) =>
    frac <= 0 ? maxZoom : Math.log2((dimPx - padding * 2) / WORLD_PX / frac)

  const zoom = Math.min(zoomFor(latFraction, height), zoomFor(lngFraction, width), maxZoom)
  return { center, zoom: Math.max(zoom, 2) }
}

export interface Journey<T extends GeoStop = GeoStop> {
  /** Khoá nhóm: tripId, hoặc `solo:<vùng>:<ngày>` cho stop lẻ. */
  id: string
  /** Stop trong nhóm, ĐÃ sort theo thời gian. */
  stops: T[]
  /** Màu accent ổn định của nhóm (vòng PLACE_COLORS). */
  color: string
}

// Khoá nhóm 1 stop: có chuyến → theo tripId; lẻ → gom theo VÙNG + NGÀY (arrivedAt
// đã kèm offset +07:00 nên cắt 10 ký tự đầu ra đúng ngày địa phương). Nhờ vậy 1
// ngày lang thang cùng tỉnh (vd Đà Lạt) thành 1 "chuyến ngày" ảo → có màu + đường.
const journeyKey = (s: GeoStop) =>
  s.tripId ? s.tripId : `solo:${s.region}:${s.arrivedAt.slice(0, 10)}`

/** Gom stop thành các "hành trình" (journey) + gán màu ổn định. Nhóm sắp theo thời
 *  điểm sớm nhất để màu KHÔNG nhảy giữa các lần render. Nguồn phân nhóm dùng chung
 *  cho route line, màu marker, cluster, tua vùng. */
export function groupJourneys<T extends GeoStop>(stops: T[]): Journey<T>[] {
  const map = new Map<string, T[]>()
  for (const s of stops) {
    const k = journeyKey(s)
    const arr = map.get(k) ?? []
    arr.push(s)
    map.set(k, arr)
  }
  const groups = [...map.entries()].map(([id, gs]) => ({
    id,
    stops: [...gs].sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt)),
  }))
  // Sắp nhóm theo điểm sớm nhất → thứ tự (và màu) ổn định qua các lần gom.
  groups.sort((a, b) => a.stops[0].arrivedAt.localeCompare(b.stops[0].arrivedAt))
  return groups.map((g, i) => ({ ...g, color: PLACE_COLORS[i % PLACE_COLORS.length] }))
}

/** Map stopId → màu journey, để marker tô cùng màu với đường nối nhóm nó. */
export function stopColors(stops: GeoStop[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const j of groupJourneys(stops)) {
    for (const s of j.stops) m.set(s.id, j.color)
  }
  return m
}

interface RouteSegment {
  type: 'Feature'
  properties: { color: string }
  geometry: { type: 'LineString'; coordinates: LngLat[] }
}

export interface RouteFeatureCollection {
  type: 'FeatureCollection'
  features: RouteSegment[]
}

// Số đoạn chia nhỏ mỗi cạnh khi vẽ nét tay — đủ mượt để cong mềm, không quá dày.
const WOBBLE_STEPS = 14
// Biên độ run = phần trăm chiều dài cạnh (nét lệch khỏi đường thẳng tối đa ~6%),
// nên trip ngắn/dài đều run cân đối thay vì lệch cứng theo mét.
const WOBBLE_AMP = 0.06

/** Nối a→b bằng đường HƠI RUN như vẽ tay (scrapbook), thay cho kẻ thẳng tăm tắp.
 *  Chia nhỏ cạnh rồi dời mỗi điểm theo phương vuông góc bằng vài sóng sin lệch pha;
 *  envelope sin(πt) khoá 2 đầu về đúng stop (không hở mối nối). Tất định (seed từ
 *  toạ độ) → mỗi lần render giống nhau, mỗi cạnh run mỗi kiểu. */
function wobbleLine(a: LngLat, b: LngLat): LngLat[] {
  const latMid = ((a[1] + b[1]) / 2) * (Math.PI / 180)
  const cosLat = Math.cos(latMid) || 1e-6
  // Vector cạnh trong không gian "mét-hoá" (nén kinh độ theo vĩ độ) để phương vuông
  // góc đều mắt ở mọi vĩ độ; quy đổi ngược khi cộng offset vào kinh độ.
  const dxm = (b[0] - a[0]) * cosLat
  const dym = b[1] - a[1]
  const len = Math.hypot(dxm, dym) || 1e-9
  const px = -dym / len // phương vuông góc (đơn vị)
  const py = dxm / len
  const amp = len * WOBBLE_AMP
  // Pha lệch theo toạ độ → các cạnh không run rập khuôn (tất định, không random).
  const phase = ((a[0] + a[1] * 3 + b[0] * 7) % (Math.PI * 2)) + Math.PI

  const out: LngLat[] = []
  for (let s = 0; s <= WOBBLE_STEPS; s++) {
    const t = s / WOBBLE_STEPS
    const bx = a[0] + (b[0] - a[0]) * t
    const by = a[1] + (b[1] - a[1]) * t
    const env = Math.sin(Math.PI * t) // 0 ở 2 đầu, mạnh nhất ở giữa
    const w =
      amp *
      env *
      (Math.sin(t * Math.PI * 3 + phase) * 0.7 +
        Math.sin(t * Math.PI * 5 + phase * 1.7) * 0.3)
    out.push([bx + (w * px) / cosLat, by + w * py])
  }
  return out
}

/** Tuyến nối các stop trong CÙNG journey theo thời gian; mỗi đoạn mang màu journey
 *  (→ mỗi chuyến/vùng một màu). Bao gồm cả "chuyến ngày" ảo của stop lẻ.
 *
 *  `snapped` (tuỳ chọn, P3): journeyId → toạ độ đường bám phố thật (Map Matching).
 *  Journey nào có snapped → vẽ 1 nét liền cong theo đường; journey chưa có (đang
 *  tải / lỗi / thiếu token) → fallback nét vẽ tay hơi run (`wobbleLine`) nên không
 *  bao giờ mất đường. */
export function routeFeatures(
  stops: GeoStop[],
  snapped?: Map<string, LngLat[]>,
): RouteFeatureCollection {
  const features: RouteSegment[] = []
  for (const j of groupJourneys(stops)) {
    const snap = snapped?.get(j.id)
    if (snap && snap.length >= 2) {
      features.push({
        type: 'Feature',
        properties: { color: j.color },
        geometry: { type: 'LineString', coordinates: snap },
      })
      continue
    }
    for (let i = 0; i < j.stops.length - 1; i++) {
      const a: LngLat = [j.stops[i].lng, j.stops[i].lat]
      const b: LngLat = [j.stops[i + 1].lng, j.stops[i + 1].lat]
      // Bỏ cạnh có đầu mút thiếu toạ độ — wobbleLine sẽ sinh NaN cho cả nét.
      if (!isLngLat(a) || !isLngLat(b)) continue
      features.push({
        type: 'Feature',
        properties: { color: j.color },
        geometry: { type: 'LineString', coordinates: wobbleLine(a, b) },
      })
    }
  }
  return { type: 'FeatureCollection', features }
}
