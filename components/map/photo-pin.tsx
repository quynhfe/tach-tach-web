import type { SharePhoto } from '@/lib/share'

// Pin ảnh của một lần ghé — bản DOM của `PhotoMarker.tsx` bên app: ô ảnh bìa
// 60×60 viền trắng bo góc, badge "+N" khi còn nhiều ảnh, tên địa điểm dưới chân.
// Đang chọn thì nảy to 1.25× và viền đổi sang màu hành trình.
//
// Địa điểm chủ giữ riêng ảnh không có bìa để vẽ → pin TRƠN màu hành trình, không
// hộp ảnh rỗng.

export function PhotoPin({
  name,
  cover,
  photoCount,
  color,
  selected,
  onSelect,
}: {
  name: string
  cover: SharePhoto | undefined
  photoCount: number
  color: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={selected ? 'pin selected' : 'pin'}
      aria-label={name}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}>
      <span className="pin-art">
        {cover ? (
          <span className="pin-frame" style={{ borderColor: selected ? color : undefined }}>
            <img src={cover.thumbUrl || cover.url} alt="" />
          </span>
        ) : (
          <span className="pin-dot" style={{ backgroundColor: color }} />
        )}
        {photoCount > 1 && (
          <span className="pin-badge" style={{ backgroundColor: color }}>
            +{photoCount - 1}
          </span>
        )}
      </span>
      <span className="pin-name">{name}</span>
    </button>
  )
}
