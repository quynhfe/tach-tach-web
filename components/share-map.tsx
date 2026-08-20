import { mappableStops, routeFeatures, stopColors } from '@/lib/map-geo'
import type { ShareStop } from '@/lib/share'

// Bản đồ ở đây là MỘT ẢNH TĨNH (Mapbox Static Images API), không phải map GL
// tương tác. Đổi lại: một request cho cả trang thay vì hàng chục tile request,
// không kéo ~500KB JS vào bundle, và người xem lạ không đốt quota map-load.
// Phần tương tác — chỉ đường, zoom vào từng nơi — là việc của app, và nút dưới
// ảnh dẫn thẳng sang đó.
//
// Style dùng `mapbox/light-v11` (style chuẩn của Mapbox) chứ không phải style
// cream tự chứa của app: Static Images API chỉ nhận style thuộc một tài khoản,
// không nhận style JSON rời. Muốn khớp màu app thì phải tạo style trên Mapbox
// Studio rồi điền NEXT_PUBLIC_MAPBOX_STATIC_STYLE.
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

export function ShareMap({
  stops,
  blurLocation,
}: {
  stops: ShareStop[]
  blurLocation: boolean
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_STORE_URL
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
      {appUrl && (
        <a className="map-cta" href={appUrl}>
          Chỉ đường tới đây · mở trong app
        </a>
      )}
      {!appUrl && (
        <p className="map-hint">
          Mở bộ sưu tập trong app Tách Tách để phóng to bản đồ và chỉ đường tới từng nơi.
        </p>
      )}
    </div>
  )
}
