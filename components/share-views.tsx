'use client'

import { useState, type ReactNode } from 'react'
import { PhotoGrid } from '@/components/photo-grid'
import { formatDayMonth, formatTime, ymdKey } from '@/lib/datetime'
import { PLACE_COLORS } from '@/lib/map-geo'
import type { PublicShare, ShareStop } from '@/lib/share'

/**
 * Gom stop theo ngày, giữ thứ tự cũ → mới mà RPC đã sắp sẵn. Gom qua Map (chứ
 * không chỉ gộp các stop LIỀN NHAU) để cùng luật với `ShareTimeline` bên app —
 * dữ liệu về không đúng thứ tự thì hai bên vẫn ra một kết quả, và không sinh ra
 * hai nhóm cùng khoá ngày.
 */
function groupByDay(stops: ShareStop[]) {
  const days: { key: string; stops: ShareStop[] }[] = []
  const byKey = new Map<string, ShareStop[]>()
  for (const stop of stops) {
    const key = ymdKey(stop.arrivedAt)
    const found = byKey.get(key)
    if (found) found.push(stop)
    else {
      const group: ShareStop[] = [stop]
      byKey.set(key, group)
      days.push({ key, stops: group })
    }
  }
  return days
}

/**
 * Hai lăng kính của cùng một bộ sưu tập — feed theo ngày và bản đồ — đúng cặp
 * mà app cho người xem chọn ở màn album. `map` nhận từ server component nên ảnh
 * bản đồ dựng sẵn phía máy chủ, phần client ở đây chỉ giữ trạng thái tab.
 */
export function ShareViews({ share, map }: { share: PublicShare; map: ReactNode }) {
  const [mode, setMode] = useState<'timeline' | 'map'>('timeline')
  const days = groupByDay(share.stops)

  return (
    <>
      <div className="view-toggle" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'timeline'}
          className={mode === 'timeline' ? 'active' : ''}
          onClick={() => setMode('timeline')}>
          Nhật ký
        </button>
        <button
          role="tab"
          aria-selected={mode === 'map'}
          className={mode === 'map' ? 'active' : ''}
          onClick={() => setMode('map')}>
          Bản đồ
        </button>
      </div>

      {mode === 'map' ? (
        map
      ) : (
        <>
          {days.length === 0 && (
            <p className="stop-place" style={{ marginTop: 32 }}>
              Bộ sưu tập này chưa có kỷ niệm nào.
            </p>
          )}

          {days.map((day, di) => {
            const color = PLACE_COLORS[di % PLACE_COLORS.length]
            return (
              <section key={day.key}>
                <div className="day-header">
                  <span className="day-label">{formatDayMonth(day.stops[0].arrivedAt)}</span>
                  <span className="day-badge" style={{ backgroundColor: color }}>
                    {day.stops.length}
                  </span>
                </div>

                {day.stops.map((stop) => {
                  const visible = share.photos.filter((p) => p.stopId === stop.id)
                  // Không còn ảnh nào hiện: hoặc chủ giữ riêng cả cụm (place
                  // card), hoặc dữ liệu cũ từ trước migration 0011 — cái sau thì
                  // bỏ qua hẳn thay vì để tên trơ trọi.
                  if (visible.length === 0 && stop.hiddenPhotoCount === 0) return null
                  return (
                    <article key={stop.id} className="stop">
                      <div className="stop-head">
                        <span className="stop-dot" style={{ backgroundColor: color }} />
                        <h2 className="stop-name">{stop.name}</h2>
                        <span className="stop-time">{formatTime(stop.arrivedAt)}</span>
                      </div>
                      {(stop.city || stop.region) && (
                        <p className="stop-place">
                          {[stop.city, stop.region].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {visible.length > 0 ? (
                        <PhotoGrid photos={visible} />
                      ) : (
                        <div className="place-card">
                          <span className="place-art" aria-hidden>
                            🎞
                          </span>
                          <p>Ảnh ở nơi này được giữ riêng</p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </section>
            )
          })}
        </>
      )}
    </>
  )
}
