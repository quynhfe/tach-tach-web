'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SharePhoto } from '@/lib/share'

// Xem ảnh full màn từ bản đồ. Vuốt ngang đổi ảnh dùng CÙNG công thức với
// PhotoViewer bên app: ăn khi đi đủ xa HOẶC đủ nhanh, nên cú vuốt ngắn mà dứt
// khoát không bị bỏ qua.
const SWIPE_DISTANCE = 40
const SWIPE_VELOCITY = 0.3 // px/ms

export function PhotoLightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: SharePhoto[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const drag = useRef<{ x: number; t: number } | null>(null)

  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), photos.length - 1)),
    [photos.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    // Khoá cuộn nền để vuốt ngang không kéo theo cả trang phía sau.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, step])

  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, t: e.timeStamp }
      }}
      onPointerUp={(e) => {
        const start = drag.current
        drag.current = null
        if (!start) return
        const dx = e.clientX - start.x
        const dt = Math.max(e.timeStamp - start.t, 1)
        if (Math.abs(dx) < SWIPE_DISTANCE && Math.abs(dx) / dt < SWIPE_VELOCITY) return
        step(dx < 0 ? 1 : -1)
      }}>
      <img
        className="lightbox-img"
        src={photo.url || photo.thumbUrl}
        alt={photo.caption ?? ''}
        onClick={(e) => e.stopPropagation()}
      />

      {photo.caption && <p className="lightbox-caption">{photo.caption}</p>}

      <button type="button" className="lightbox-close" aria-label="Đóng" onClick={onClose}>
        ✕
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav prev"
            aria-label="Ảnh trước"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}>
            ‹
          </button>
          <button
            type="button"
            className="lightbox-nav next"
            aria-label="Ảnh sau"
            disabled={index === photos.length - 1}
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}>
            ›
          </button>
          <span className="lightbox-count">
            {index + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  )
}
