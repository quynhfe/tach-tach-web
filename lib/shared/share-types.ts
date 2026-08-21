// GENERATED từ tach-bru/src/shared/share-types.ts — ĐỪNG SỬA FILE NÀY.
// Sửa ở NGUỒN rồi chạy `npm run sync:shared` bên repo app.

// ---------------------------------------------------------------------------
// Hình dạng dữ liệu của một bộ sưu tập công khai (RPC `get_share_by_slug`).
// Dùng chung app ↔ web để hai bên không lệch nhau khi RPC đổi.
// ---------------------------------------------------------------------------

export interface ShareStop {
  id: string
  name: string
  arrivedAt: string
  city: string
  region: string
  coverPhotoId: string | null
  tripId: string | null
  /** null = kỷ niệm chưa gán vị trí; RPC đã làm mờ sẵn nếu chủ share bật toggle. */
  lat: number | null
  lng: number | null
  /**
   * Số ảnh CÒN SỐNG nhưng chủ share bỏ tick. Địa điểm xoá sạch ảnh đã bị RPC
   * loại từ nguồn (migration 0011), nên `hiddenPhotoCount > 0` mà không còn ảnh
   * nào hiển thị nghĩa là chủ cố ý giữ riêng — trang xem vẽ place card thay vì
   * bỏ trống.
   */
  hiddenPhotoCount: number
}

export interface SharePhoto {
  id: string
  stopId: string
  url: string
  thumbUrl: string
  width: number
  height: number
  caption?: string
  takenAt: string
}

export interface PublicShare {
  name: string
  slug: string
  expiresAt: string | null
  viewCount: number
  heartCount: number
  /** Chủ share bật "Làm mờ vị trí" — toạ độ về tới đây đã bị làm tròn ~1km. */
  blurLocation: boolean
  stops: ShareStop[]
  photos: SharePhoto[]
}
