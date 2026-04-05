const GRID_START = 360 // 06:00 in minutes

function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0')
  const m = (min % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function TimeBlock({ schedule, role, isVisible, onClick, rowHeight = 60 }) {
  const top = (schedule.startMinute - GRID_START) / 60 * rowHeight
  const height = Math.max((schedule.endMinute - schedule.startMinute) / 60 * rowHeight, 15)

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        left: '2px',
        right: '2px',
        backgroundColor: role?.color ?? schedule.color,
      }}
      className={[
        'rounded px-1.5 py-1 overflow-hidden cursor-pointer select-none transition-opacity',
        !isVisible
          ? 'opacity-0 pointer-events-none'
          : schedule.isDone
            ? 'opacity-30'
            : 'opacity-100',
      ].join(' ')}
    >
      {isVisible && (
        <p className="text-white text-[0.6rem] font-medium leading-tight truncate pt-0.5">
          {schedule.title}
        </p>
      )}
      {isVisible && (
        <p className="print-only text-white text-[0.55rem] leading-tight opacity-90"
           style={{ position: 'absolute', bottom: '2px', right: '3px' }}>
          {(schedule.endMinute - schedule.startMinute) <= 30
            ? `${schedule.endMinute - schedule.startMinute}분`
            : `${minutesToTime(schedule.startMinute)} – ${minutesToTime(schedule.endMinute)}`
          }
        </p>
      )}
    </div>
  )
}
