import { AppBanner } from '@/components/app-banner'

/**
 * Gốc domain. Trang này chỉ tồn tại để ai gõ trần domain không gặp lỗi 404 —
 * mọi thứ đáng xem đều nằm sau một link chia sẻ cụ thể.
 */
export default function Home() {
  return (
    <>
      <main className="notice">
        <h1>Tách Tách</h1>
        <p>
          Nhật ký hành trình trên bản đồ. Mở một link chia sẻ để xem bộ sưu tập bạn được gửi.
        </p>
      </main>
      <AppBanner />
    </>
  )
}
