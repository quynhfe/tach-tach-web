import { formatTime } from '@/lib/datetime'
import { directionsUrl } from '@/lib/map-links'
import type { SharePhoto, ShareStop } from '@/lib/share'

// Card xem trước hiện khi chạm pin — bản DOM của `StopPreviewCard.tsx` bên app:
// dải màu hành trình trên đầu, ảnh bìa + tên + tỉnh, rồi hai lối đi tiếp.
//
// Card cũng là chỗ đặt hai thứ trước đây không có nhà: nút "Chỉ đường" (không
// treo lơ lửng dưới map nữa) và câu "ảnh giữ riêng" (không làm tooltip, dễ hụt
// trên mobile).

export function StopPreviewCard({
  stop,
  cover,
  photoCount,
  color,
  onViewPhotos,
  onClose,
}: {
  stop: ShareStop & { lat: number; lng: number }
  cover: SharePhoto | undefined
  photoCount: number
  color: string
  onViewPhotos: () => void
  onClose: () => void
}) {
  const place = [stop.city, stop.region].filter(Boolean).join(', ')

  return (
    <div className="preview-card" onClick={(e) => e.stopPropagation()}>
      <div className="preview-accent" style={{ backgroundColor: color }} />
      <div className="preview-body">
        <div className="preview-head">
          <span className="preview-thumb">
            {cover && <img src={cover.thumbUrl || cover.url} alt="" />}
          </span>
          <span className="preview-text">
            <strong className="preview-name">{stop.name}</strong>
            <span className="preview-place">
              {formatTime(stop.arrivedAt)}
              {place && ` · ${place}`}
            </span>
          </span>
          <button type="button" className="preview-close" aria-label="Đóng" onClick={onClose}>
            ✕
          </button>
        </div>

        {photoCount > 0 ? (
          <div className="preview-actions">
            <button type="button" className="btn-primary" onClick={onViewPhotos}>
              Xem ảnh · {photoCount}
            </button>
            <a
              className="btn-secondary"
              href={directionsUrl(stop.lat, stop.lng, stop.name)}
              target="_blank"
              rel="noreferrer">
              Chỉ đường
            </a>
          </div>
        ) : (
          <>
            <p className="preview-private">Ảnh ở nơi này được giữ riêng</p>
            <div className="preview-actions">
              <a
                className="btn-secondary wide"
                href={directionsUrl(stop.lat, stop.lng, stop.name)}
                target="_blank"
                rel="noreferrer">
                Chỉ đường
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
