// ---------------------------------------------------------------------------
// Định dạng ngày/giờ theo giờ Việt Nam, khớp `src/lib/datetime.ts` bên app.
// Cố định timeZone để trang hiện đúng giờ chuyến đi bất kể người xem đang ở đâu.
// ---------------------------------------------------------------------------

const TZ = 'Asia/Ho_Chi_Minh'

const ymdFmt = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TZ,
})

/** "2026-08-20" — khoá gom nhóm theo ngày. */
export const ymdKey = (iso: string) => ymdFmt.format(new Date(iso))

/** "08:30" — giờ tới địa điểm. */
export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  }).format(new Date(iso))

/** "Thứ Hai, 12/8" — nhãn header ngày. */
export const formatDayShort = (iso: string) => {
  const weekday = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, weekday: 'long' }).format(
    new Date(iso),
  )
  const k = ymdKey(iso)
  return `${weekday}, ${Number(k.slice(8, 10))}/${Number(k.slice(5, 7))}`
}

/** "20.08.2026 08:30" — dấu giờ kiểu datestamp máy film. */
export const formatFilmDateTime = (iso: string) => {
  const k = ymdKey(iso)
  return `${k.slice(8, 10)}.${k.slice(5, 7)}.${k.slice(0, 4)} ${formatTime(iso)}`
}

/** "Còn 5 ngày" / "Đã hết hạn" / null = vĩnh viễn. */
export const expiryLabel = (expiresAt: string | null) => {
  if (!expiresAt) return null
  const msLeft = new Date(expiresAt).getTime() - Date.now()
  if (msLeft <= 0) return 'Đã hết hạn'
  return `Còn ${Math.ceil(msLeft / (24 * 60 * 60 * 1000))} ngày`
}
