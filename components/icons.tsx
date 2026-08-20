/**
 * Icon của trang, vẽ tay theo phom Iconsax (nét 1.5, bo tròn đầu) — cùng bộ mà
 * app dùng qua `iconsax-react-native`. Bộ đó chỉ chạy trên React Native nên web
 * dựng lại vài hình cần dùng thay vì kéo thêm thư viện icon cho ba cái hình.
 *
 * Icon ở đây thuần trang trí, đứng cạnh tiêu đề đã nói rõ nghĩa → aria-hidden.
 */
type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
})

/** Ghim bản đồ — hành trình được đánh dấu theo địa điểm. */
export function MapPinIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 21.5c3.5-3.6 7-6.9 7-11a7 7 0 1 0-14 0c0 4.1 3.5 7.4 7 11Z" />
      <circle cx="12" cy="10.5" r="2.6" />
    </svg>
  )
}

/** Máy ảnh — ảnh chụp dọc đường là chất liệu chính của nhật ký. */
export function CameraIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h1.2a1.6 1.6 0 0 0 1.35-.74l.8-1.27A1.6 1.6 0 0 1 10.2 4.2h3.6a1.6 1.6 0 0 1 1.35.79l.8 1.27A1.6 1.6 0 0 0 17.3 7h1.2A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-7Z" />
      <circle cx="12" cy="12.8" r="3.4" />
    </svg>
  )
}

/** Chia sẻ — link gửi cho người thân, không cần họ cài app. */
export function ShareIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="18" cy="5.5" r="2.75" />
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="18" cy="18.5" r="2.75" />
      <path d="M15.6 6.9 8.4 10.6M8.4 13.4l7.2 3.7" />
    </svg>
  )
}

/** Con mắt — số lượt xem của bộ sưu tập. */
export function EyeIcon({ size = 15 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </svg>
  )
}

/** Trái tim — lượt thả tim, tô đặc để đọc ra ngay ở cỡ chữ nhỏ. */
export function HeartIcon({ size = 15 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" strokeWidth={0}>
      <path d="M12 20.4c-.4 0-.8-.14-1.1-.4-3.9-3.2-7.4-6.1-7.4-9.9a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4c0 3.8-3.5 6.7-7.4 9.9-.3.26-.7.4-1.1.4Z" />
    </svg>
  )
}

/** Đồng hồ — hạn còn lại của link chia sẻ. */
export function ClockIcon({ size = 15 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.6V12l2.9 1.8" />
    </svg>
  )
}
