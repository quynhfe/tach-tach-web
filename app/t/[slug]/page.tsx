import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppBanner } from '@/components/app-banner'
import { BrandMark } from '@/components/brand-mark'
import { ClockIcon, EyeIcon, HeartIcon } from '@/components/icons'
import { ShareMap } from '@/components/share-map'
import { ShareViews } from '@/components/share-views'
import { expiryLabel } from '@/lib/datetime'
import { coverPhoto, getPublicShare, incrementShareView } from '@/lib/share'
import type { PublicShare } from '@/lib/share'

// Presigned URL sống 1 giờ, còn share thì chủ nhân sửa được bất cứ lúc nào →
// render mỗi request. Server ký lại URL nên ảnh không chết vì để tab mở lâu.
export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

/**
 * Địa điểm THỰC SỰ hiện ra trang: còn ảnh hiển thị, hoặc chủ giữ riêng ảnh (hiện
 * place card). RPC đã bỏ địa điểm xoá sạch ảnh từ nguồn; lọc thêm ở đây để số
 * đếm không kể những share cũ tạo trước migration 0011.
 */
function visibleStops(share: PublicShare) {
  return share.stops.filter(
    (s) => s.hiddenPhotoCount > 0 || share.photos.some((p) => p.stopId === s.id),
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const share = await getPublicShare(slug).catch(() => null)
  if (!share) return { title: 'Link không còn hợp lệ · Tách Tách' }

  const cover = coverPhoto(share)
  const title = `${share.name} · Tách Tách`
  const description = `${visibleStops(share).length} địa điểm · ${share.photos.length} kỷ niệm`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      // URL ký hết hạn sau 1 giờ; Zalo/Messenger lấy preview ngay lúc paste nên
      // vẫn kịp, và mỗi lần crawl lại là một URL mới.
      images: cover ? [{ url: cover.url, width: cover.width, height: cover.height }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      images: cover ? [cover.url] : undefined,
    },
  }
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params
  const share = await getPublicShare(slug).catch(() => null)
  if (!share) notFound()

  // Fire-and-forget: người xem không phải chờ số đếm ghi xong mới thấy ảnh.
  void incrementShareView(slug)

  const expiry = expiryLabel(share.expiresAt)

  return (
    <>
      <main className="page">
        <p className="masthead">
          <BrandMark size={26} />
          <span className="masthead-note">· bộ sưu tập chia sẻ</span>
        </p>
        <h1 className="share-title">{share.name}</h1>
        <div className="share-meta">
          <span>{visibleStops(share).length} địa điểm</span>
          <span>{share.photos.length} kỷ niệm</span>
          <span className="meta-stat">
            <EyeIcon />
            {share.viewCount}
          </span>
          <span className="meta-stat heart">
            <HeartIcon />
            {share.heartCount}
          </span>
          {expiry && (
            <span className="meta-stat expiry">
              <ClockIcon />
              {expiry}
            </span>
          )}
        </div>
        <hr className="rule" />

        <ShareViews
          share={share}
          map={
            <ShareMap
              stops={share.stops}
              photos={share.photos}
              blurLocation={share.blurLocation}
            />
          }
        />
      </main>
      <AppBanner />
    </>
  )
}
