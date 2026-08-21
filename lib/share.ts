import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Đọc một bộ sưu tập công khai. Bản port của `src/hooks/usePublicShare.ts` bên
// repo app — cùng RPC, cùng Edge Function, chỉ đổi chỗ chạy: ở đây là server
// component nên ảnh được ký lại mỗi request, không cần lo presigned URL hết hạn.
// ---------------------------------------------------------------------------

// Kiểu dữ liệu dùng chung với app — bản sao sinh từ tach-bru/src/shared.
export type { ShareStop, SharePhoto, PublicShare } from '@/lib/shared/share-types'
import type { PublicShare, SharePhoto } from '@/lib/shared/share-types'

type StopRow = {
  id: string
  name: string
  arrived_at: string
  city: string
  region: string
  cover_photo_id: string | null
  trip_id: string | null
  lat: number | null
  lng: number | null
  hidden_photo_count: number | null
}

type PhotoRow = {
  id: string
  stop_id: string
  object_key: string
  thumb_key: string
  thumb_md_key: string | null
  width: number
  height: number
  caption: string | null
  taken_at: string
}

type ShareRpcResult = {
  share: {
    id: string
    slug: string
    name: string
    tripId: string | null
    expiresAt: string | null
    viewCount: number
    heartCount: number
    blurLocation: boolean
  }
  stops: StopRow[] | null
  photos: PhotoRow[] | null
}

/**
 * Ký URL đọc cho danh sách key. `sign-read` chỉ ký những key thực sự nằm trong
 * share ứng với slug (whitelist phía Edge Function), nên gửi kèm slug là đủ —
 * không cần và không được có phiên đăng nhập ở đây.
 */
async function signReadUrls(keys: string[], slug: string): Promise<Record<string, string>> {
  if (keys.length === 0) return {}
  const { data, error } = await supabase.functions.invoke('sign-read', {
    body: { keys, slug },
  })
  if (error) throw new Error(`sign-read: ${error.message}`)
  return (data ?? {}) as Record<string, string>
}

/** Trả null khi slug sai, share đã xoá, hoặc link đã hết hạn (RPC tự lọc hạn). */
export async function getPublicShare(slug: string): Promise<PublicShare | null> {
  const { data, error } = await supabase.rpc('get_share_by_slug', { p_slug: slug })
  if (error) throw new Error(`get_share_by_slug: ${error.message}`)
  if (!data) return null

  const result = data as ShareRpcResult
  const photoRows = result.photos ?? []
  const urls = await signReadUrls(
    // thumb_md_key null với ảnh upload trước khi có tầng ảnh trung.
    photoRows.flatMap((p) =>
      [p.object_key, p.thumb_key, p.thumb_md_key].filter((k): k is string => !!k),
    ),
    slug,
  )

  return {
    name: result.share.name,
    slug: result.share.slug,
    expiresAt: result.share.expiresAt,
    viewCount: result.share.viewCount,
    heartCount: result.share.heartCount,
    blurLocation: Boolean(result.share.blurLocation),
    stops: (result.stops ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      arrivedAt: s.arrived_at,
      city: s.city,
      region: s.region,
      coverPhotoId: s.cover_photo_id,
      tripId: s.trip_id,
      lat: s.lat,
      lng: s.lng,
      hiddenPhotoCount: s.hidden_photo_count ?? 0,
    })),
    photos: photoRows.map((p) => ({
      id: p.id,
      stopId: p.stop_id,
      url: urls[p.object_key] ?? '',
      thumbUrl: urls[p.thumb_key] ?? urls[p.object_key] ?? '',
      // Để undefined khi không có bản trung — chỗ đọc tự lùi về ảnh gốc.
      thumbMdUrl: (p.thumb_md_key ? urls[p.thumb_md_key] : undefined) || undefined,
      width: p.width,
      height: p.height,
      caption: p.caption ?? undefined,
      takenAt: p.taken_at,
    })),
  }
}

/** Đếm lượt xem — hỏng thì kệ, không được chặn trang hiện ra. */
export async function incrementShareView(slug: string): Promise<void> {
  try {
    await supabase.rpc('increment_share_view', { p_slug: slug })
  } catch {
    // im lặng: số đếm không đáng để đánh đổi một trang lỗi
  }
}

/** Ảnh bìa của bộ sưu tập — dùng cho OG preview và ảnh mở đầu trang. */
export function coverPhoto(share: PublicShare): SharePhoto | undefined {
  const firstStop = share.stops[0]
  if (firstStop?.coverPhotoId) {
    const byCover = share.photos.find((p) => p.id === firstStop.coverPhotoId)
    if (byCover) return byCover
  }
  return share.photos[0]
}
