// Chỉ đường THẬT là việc của app bản đồ ngoài — trang chia sẻ chỉ bàn giao toạ
// độ. Cùng cách `src/lib/mapLinks.ts` bên app: ưu tiên Google Maps vì link web
// của nó mở được cả app lẫn trình duyệt; iOS không có Google Maps thì Apple Maps
// vẫn nhận. Không phụ thuộc app Tách Tách nên chạy được ngay khi app chưa lên store.

const isIos = () =>
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

/** URL chỉ đường tới một toạ độ, chọn theo hệ điều hành người xem. */
export function directionsUrl(lat: number, lng: number, label?: string) {
  const dest = `${lat},${lng}`
  if (isIos()) return `https://maps.apple.com/?daddr=${dest}&dirflg=d`
  const query = label ? `&destination=${encodeURIComponent(label)}` : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${query}&travelmode=driving`
}
