import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'

// Cùng font với app để trang chia sẻ đọc ra là Tách Tách ngay từ chữ đầu tiên.
const quicksand = Quicksand({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  title: 'Tách Tách',
  description: 'Nhật ký hành trình trên bản đồ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={quicksand.variable}>
      <body>{children}</body>
    </html>
  )
}
