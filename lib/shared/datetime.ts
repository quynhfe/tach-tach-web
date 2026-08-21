// GENERATED từ tach-bru/src/shared/datetime.ts — ĐỪNG SỬA FILE NÀY.
// Sửa ở NGUỒN rồi chạy `npm run sync:shared` bên repo app.

// ---------------------------------------------------------------------------
// Định dạng ngày/giờ theo giờ Việt Nam — dùng chung cho timeline, map, share…
// Cố định timeZone để hiển thị đồng nhất bất kể máy người xem đặt múi giờ nào
// (ảnh chuyến đi ghi giờ +07:00 trong EXIF).
// ---------------------------------------------------------------------------

const TZ = 'Asia/Ho_Chi_Minh'

/** "08:30" — giờ tới địa điểm. */
export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  }).format(new Date(iso))

/** "Thứ Bảy, 12 tháng 4" — tiêu đề của một ngày trong hành trình. */
export const formatDayDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: TZ,
  }).format(new Date(iso))

/** "12–15 tháng 4 2026" — khoảng ngày của cả chuyến (gộp tháng/năm nếu trùng). */
export const formatDateRange = (startIso: string, endIso: string) => {
  // Tự ghép chuỗi thay vì để Intl lo cả cụm: mẫu ngày tiếng Việt của iOS có tiền
  // tố "ngày" (→ "21–ngày 21 tháng 8, 2026"), của Node/Android thì không. Ghép tay
  // cho hai nền tảng đọc giống hệt nhau.
  const s = ymdKey(startIso)
  const e = ymdKey(endIso)
  const day = (k: string) => Number(k.slice(8, 10))
  const month = (k: string) => Number(k.slice(5, 7))
  const year = (k: string) => k.slice(0, 4)
  const endFull = `${day(e)} tháng ${month(e)}, ${year(e)}`
  // Đi về trong ngày → chỉ một ngày, khỏi "21–21".
  if (s === e) return endFull
  if (month(s) === month(e) && year(s) === year(e)) return `${day(s)}–${endFull}`
  return `${day(s)} tháng ${month(s)} – ${endFull}`
}

// --- Khoá & nhãn cho timeline Nhật ký (nhóm theo năm/tháng/ngày) -------------
// Dùng 'en-CA' để ra khoá ổn định "YYYY-MM-DD" theo giờ VN, rồi tự dựng nhãn
// tiếng Việt (kiểm soát được viết hoa, không lệ thuộc locale).
const ymdFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** "2026-08-12" — khoá gom theo ngày. */
export const ymdKey = (iso: string) => ymdFmt.format(new Date(iso))
/** "2026-08" — khoá gom theo tháng. */
export const ymKey = (iso: string) => ymdKey(iso).slice(0, 7)
/** "2026" — khoá gom theo năm. */
export const yKey = (iso: string) => ymdKey(iso).slice(0, 4)

/** "25 tháng 8" — ngày + tháng (không thứ, không năm) cho header nhóm ngày. */
export const formatDayMonth = (iso: string) => {
  const k = ymdKey(iso)
  return `${Number(k.slice(8, 10))} tháng ${Number(k.slice(5, 7))}`
}

/** "Tháng 8, 2026" — nhãn mốc tháng. */
export const formatMonthYear = (iso: string) => {
  const k = ymdKey(iso)
  return `Tháng ${Number(k.slice(5, 7))}, ${k.slice(0, 4)}`
}

/** "12–15.04.2026" — khoảng ngày ngắn kiểu film stamp cho card chuyến. */
export const formatCompactDateRange = (startIso: string, endIso: string) => {
  const k1 = ymdKey(startIso)
  const k2 = ymdKey(endIso)
  const d1 = k1.slice(8, 10), m1 = k1.slice(5, 7), y1 = k1.slice(0, 4)
  const d2 = k2.slice(8, 10), m2 = k2.slice(5, 7), y2 = k2.slice(0, 4)
  if (m1 === m2 && y1 === y2) return `${d1}-${d2}.${m1}.${y1}`
  if (y1 === y2) return `${d1}.${m1}-${d2}.${m2}.${y1}`
  return `${d1}.${m1}.${y1}-${d2}.${m2}.${y2}`
}

/** "12.08.2026 21:15" — datestamp đầy đủ kiểu máy film (cho ảnh xuất về máy,
 *  nơi không có header ngày bên cạnh như trong app). */
export const formatFilmDateTime = (iso: string) => {
  const k = ymdKey(iso)
  return `${k.slice(8, 10)}.${k.slice(5, 7)}.${k.slice(0, 4)} ${formatTime(iso)}`
}

/** "Thứ Hai, 12/8" — nhãn header ngày trong timeline. */
export const formatDayShort = (iso: string) => {
  const weekday = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, weekday: 'long' }).format(
    new Date(iso),
  )
  const k = ymdKey(iso)
  return `${weekday}, ${Number(k.slice(8, 10))}/${Number(k.slice(5, 7))}`
}

/** "Thứ Hai, 3/8" của HÔM NAY — cho nhãn "hiện tại" trên header Nhật ký. */
export const todayShort = () => formatDayShort(new Date().toISOString())

/** "Còn 5 ngày" / "Đã hết hạn" cho link chia sẻ; null = link vĩnh viễn. */
export const expiryLabel = (expiresAt: string | null) => {
  if (!expiresAt) return null
  const msLeft = new Date(expiresAt).getTime() - Date.now()
  if (msLeft <= 0) return 'Đã hết hạn'
  return `Còn ${Math.ceil(msLeft / (24 * 60 * 60 * 1000))} ngày`
}
