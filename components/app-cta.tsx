import { BrandMark } from '@/components/brand-mark'

/** Ba khoảnh khắc quen thuộc của một chuyến đi, dán nghiêng như sticker. */
const STICKERS = ['picnic', 'camping', 'beach']

/**
 * Lời mời tải app, đặt ở cuối trang — người xem vừa lướt hết ảnh của bạn mình
 * xong mới là lúc dễ muốn có một cuốn cho riêng họ. Trước đây việc này do một
 * thanh dính đáy đảm nhiệm, nhưng chưa có link store thì thanh đó không có nút,
 * hoá ra chỉ còn là dải trắng che mất ảnh cuối trang.
 *
 * Chưa lên store thì nút dẫn về trang giới thiệu, luôn có chỗ để đi tiếp.
 */
export function AppCta() {
  const storeUrl = process.env.NEXT_PUBLIC_APP_STORE_URL

  return (
    <section className="app-cta">
      <div className="app-cta-stickers" aria-hidden="true">
        {STICKERS.map((name) => (
          <img key={name} src={`/illust/${name}.png`} alt="" width={200} height={200} />
        ))}
      </div>

      <h2>Chuyến của bạn cũng đáng được kể lại</h2>
      <p>
        Cứ chụp dọc đường, Tách Tách xếp giúp thành cuốn nhật ký có ngày có nơi chốn —
        rồi gói lại thành một link như trang này để gửi đi.
      </p>

      <a className="app-cta-btn" href={storeUrl ?? '/'}>
        {storeUrl ? 'Tải Tách Tách' : 'Xem Tách Tách làm được gì'}
      </a>

      <p className="app-cta-foot">
        <BrandMark size={20} />
        <span>Nhật ký hành trình trên bản đồ</span>
      </p>
    </section>
  )
}
