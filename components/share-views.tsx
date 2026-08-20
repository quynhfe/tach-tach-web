'use client'

import { useState, type ReactNode } from 'react'
import { PhotoGrid } from '@/components/photo-grid'
import { formatDayShort, formatTime, ymdKey } from '@/lib/datetime'
import { PLACE_COLORS } from '@/lib/map-geo'
import type { PublicShare, ShareStop } from '@/lib/share'

/** Gom stop theo ngày, giữ thứ tự cũ → mới mà RPC đã sắp sẵn. */
function groupByDay(stops: ShareStop[]) {
  const days: { key: string; stops: ShareStop[] }[] = []
  for (const stop of stops) {
    const key = ymdKey(stop.arrivedAt)
    const last = days[days.length - 1]
    if (last?.key === key) last.stops.push(stop)
    else days.push({ key, stops: [stop] })
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
                  <span className="day-badge" style={{ backgroundColor: color }}>
                    {formatDayShort(day.stops[0].arrivedAt)}
                  </span>
                  <span className="day-count">{day.stops.length} địa điểm</span>
                </div>

                {day.stops.map((stop) => (
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
                    <PhotoGrid photos={share.photos.filter((p) => p.stopId === stop.id)} />
                  </article>
                ))}
              </section>
            )
          })}
        </>
      )}
    </>
  )
}
