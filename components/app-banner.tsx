import { BrandMark } from '@/components/brand-mark'

/**
 * Banner dính đáy. Link store để trống tới khi app lên store thật — lúc đó điền
 * `NEXT_PUBLIC_APP_STORE_URL`, chưa có thì banner chỉ còn lời giới thiệu, không
 * dựng một nút bấm vào không đi đâu cả.
 */
export function AppBanner() {
  const storeUrl = process.env.NEXT_PUBLIC_APP_STORE_URL

  return (
    <div className={storeUrl ? 'app-banner' : 'app-banner centered'}>
      <BrandMark size={34} wordmark={false} />
      <div className="text">
        <p className="title">Tách Tách</p>
        <p className="sub">Nhật ký hành trình trên bản đồ</p>
      </div>
      {storeUrl && <a href={storeUrl}>Mở trong app</a>}
    </div>
  )
}
