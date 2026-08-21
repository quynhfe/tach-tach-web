import { formatFilmDateTime } from '@/lib/datetime'
import type { SharePhoto } from '@/lib/share'

const COLUMNS = 2

/**
 * Chia ảnh vào các cột: ảnh kế tiếp rơi vào cột đang NGẮN hơn để hai cột kết
 * thúc cao xấp xỉ nhau. Cùng thuật toán với `MasonryGrid` bên app, và biết
 * trước tỉ lệ ảnh nên tính được ngay khi render trên máy chủ.
 *
 * Không dùng CSS `columns`: Chrome vẽ LẶP phần tử định vị tuyệt đối nằm trong
 * multi-column sang cột bên cạnh — băng keo washi hoá thành mấy mẩu trôi lơ
 * lửng giữa trang.
 */
function splitColumns(photos: SharePhoto[]) {
  const cols: SharePhoto[][] = Array.from({ length: COLUMNS }, () => [])
  const heights = new Array(COLUMNS).fill(0)
  for (const p of photos) {
    let i = 0
    for (let c = 1; c < COLUMNS; c++) if (heights[c] < heights[i]) i = c
    cols[i].push(p)
    heights[i] += p.height / p.width
  }
  return cols
}

/**
 * Lưới ảnh kiểu scrapbook — mỗi tấm một khung giấy trắng nghiêng nhẹ, băng keo
 * washi ở mép, dấu giờ film góc phải-trên, caption dưới mép giấy.
 */
export function PhotoGrid({ photos }: { photos: SharePhoto[] }) {
  if (photos.length === 0) return null

  return (
    <div className="grid">
      {splitColumns(photos).map((col, ci) => (
        <div className="grid-col" key={ci}>
          {col.map((p, i) => (
            <figure key={p.id} className={i % 2 ? 'photo tilt-b' : 'photo tilt-a'}>
              <div className="frame">
                <span className="washi" aria-hidden />
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
      ))}
    </div>
  )
}
