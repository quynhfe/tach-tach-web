import { formatFilmDateTime } from '@/lib/datetime'
import type { SharePhoto } from '@/lib/share'

/**
 * Lưới ảnh kiểu scrapbook — mỗi tấm một khung giấy trắng, dấu giờ film ở góc,
 * caption nằm dưới mép giấy. CSS columns cho chiều cao tự nhiên của từng ảnh
 * (đúng tinh thần MasonryGrid bên app) mà không cần đo bằng JS.
 */
export function PhotoGrid({ photos }: { photos: SharePhoto[] }) {
  if (photos.length === 0) return null

  return (
    <div className="grid">
      {photos.map((p) => (
        <figure key={p.id} className="photo">
          <div className="frame">
            <img
              src={p.thumbUrl || p.url}
              alt={p.caption ?? ''}
              width={p.width}
              height={p.height}
              loading="lazy"
            />
            <span className="film-stamp">{formatFilmDateTime(p.takenAt)}</span>
          </div>
          {p.caption && <figcaption className="caption">{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
