'use client'

import { useState } from 'react'
import { PhotoGrid } from '@/components/photo-grid'
import { ShareMap } from '@/components/share-map'
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
 * mà app cho người xem chọn ở màn album. Bản đồ chỉ dựng khi người xem mở tới
 * nó, để ai chỉ muốn xem ảnh không phải trả tiền băng thông cho tile.
 */
export function ShareViews({ share }: { share: PublicShare }) {
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
        <div className="map-wrap">
          <ShareMap stops={share.stops} photos={share.photos} />
          {share.blurLocation && (
            <span className="map-blur-note">Vị trí đã được làm mờ</span>
          )}
        </div>
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
