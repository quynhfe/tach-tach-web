import { AppCta } from '@/components/app-cta'

/**
 * Slug sai, share đã xoá, hoặc link hết hạn — RPC trả null cho cả ba nên trang
 * nói chung một câu. Không phân biệt "sai" với "hết hạn": người nhận link không
 * làm gì được khác nhau, mà nói rõ lại là đường dò slug.
 */
export default function ShareNotFound() {
  return (
    <>
      <main className="notice">
        {/* Minh hoạ trang trí — câu chữ bên dưới đã nói đủ. */}
        <img className="notice-art" src="/illust-trip.png" alt="" width={700} height={626} />
        <h1>Link không còn hợp lệ</h1>
        <p>
          Bộ sưu tập này đã hết hạn hoặc đã được gỡ. Hỏi người gửi xin link mới giúp bạn nhé.
        </p>
      </main>
      <div className="page notice-cta">
        <AppCta />
      </div>
    </>
  )
}
