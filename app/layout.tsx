import type { Metadata } from 'next'
import { Baloo_2, Quicksand } from 'next/font/google'
import './globals.css'

// Cùng font với app để trang chia sẻ đọc ra là Tách Tách ngay từ chữ đầu tiên.
const quicksand = Quicksand({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
})

// Font hiển thị của thương hiệu — chỉ dùng cho wordmark và tiêu đề lớn, khớp
// `Baloo2_800ExtraBold` mà app dùng.
const baloo = Baloo_2({
  subsets: ['latin', 'vietnamese'],
  weight: ['800'],
  variable: '--font-baloo',
})

/**
 * Ảnh OG phải là URL tuyệt đối. Chưa gắn domain riêng thì lấy domain Vercel tự
 * cấp qua `VERCEL_URL` — không phải khai báo biến nào, và deploy đâu đúng đó.
 */
const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Tách Tách — Nhật ký hành trình trên bản đồ',
  description:
    'Tách Tách gom ảnh dọc đường thành nhật ký có ngày, có nơi chốn, rồi gói lại trong một link để gửi cho người bạn muốn khoe.',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Tách Tách',
    description: 'Nhật ký hành trình trên bản đồ',
    type: 'website',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${quicksand.variable} ${baloo.variable}`}>
      <body>{children}</body>
    </html>
  )
}
