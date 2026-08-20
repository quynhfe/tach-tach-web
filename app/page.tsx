import { BrandMark } from '@/components/brand-mark'
import { CameraIcon, MapPinIcon, ShareIcon } from '@/components/icons'

/**
 * Gốc domain. Người tới đây hoặc là gõ trần địa chỉ, hoặc vừa xem xong một link
 * chia sẻ rồi bấm lên logo — cả hai đều chưa biết Tách Tách là gì, nên trang
 * giới thiệu app thay vì báo lỗi. Không gắn banner dính đáy: banner nói đúng
 * những gì hero đã nói, để cả hai thành ra lặp.
 */

const FOOTER_STICKERS = [
  'friends-cafe',
  'picnic',
  'camping',
  'beach',
  'dining-feast',
  'celebrate-cake',
]

const FEATURES = [
  {
    icon: <CameraIcon />,
    tone: 'brand',
    title: 'Chụp là xong',
    desc: 'Ảnh tự gắn giờ và nơi chụp, không phải ngồi ghi chú lại sau chuyến đi.',
  },
  {
    icon: <MapPinIcon />,
    tone: 'pink',
    title: 'Xem theo bản đồ',
    desc: 'Cả hành trình hiện thành đường đi và các điểm dừng, theo đúng thứ tự ngày.',
  },
  {
    icon: <ShareIcon />,
    tone: 'blue',
    title: 'Gửi một cái link',
    desc: 'Người nhận mở bằng trình duyệt là xem được, không cần cài app hay đăng nhập.',
  },
]

export default function Home() {
  const storeUrl = process.env.NEXT_PUBLIC_APP_STORE_URL

  return (
    <div className="landing">
      <header className="landing-head">
        <BrandMark size={512} />
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Nhật ký hành trình</p>
            <h1>
              Chuyến đi của bạn,
              <br />
              kể trên bản đồ
            </h1>
            <p className="lede">
              Tách Tách gom ảnh dọc đường thành một cuốn nhật ký có ngày, có nơi chốn — rồi
              gói lại trong một link để gửi cho người bạn muốn khoe.
            </p>

            <div className="hero-actions">
              {storeUrl ? (
                <a className="btn-primary" href={storeUrl}>
                  Tải Tách Tách
                </a>
              ) : (
                <span className="btn-ghost">Sắp có trên App Store</span>
              )}
              <p className="hero-note">
                Được gửi một link chia sẻ? Mở thẳng link đó để xem bộ sưu tập.
              </p>
            </div>
          </div>

          {/* Ảnh trang trí, ý nghĩa đã nằm hết trong phần chữ bên cạnh. */}
          <img className="hero-art" src="/illust-share.png" alt="" width={700} height={640} />
        </section>

        <section className="features">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature">
              <span className={`feature-icon tone-${f.tone}`}>{f.icon}</span>
              <h2>{f.title}</h2>
              <p>{f.desc}</p>
            </article>
          ))}
        </section>
      </main>

      <div className="sticker-strip" aria-hidden="true">
        {FOOTER_STICKERS.map((name) => (
          <img key={name} src={`/illust/${name}.png`} alt="" width={200} height={200} />
        ))}
      </div>

      <footer className="landing-foot">
        <span className="foot-name">Tách Tách</span>
        <span>Nhật ký hành trình trên bản đồ</span>
      </footer>
    </div>
  )
}
