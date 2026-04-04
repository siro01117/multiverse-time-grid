const GRID_START = 360 // 06:00 in minutes
const MIN_HEIGHT = 15

export default function TimeBlock({ schedule, role, isVisible, onClick }) {
  const top = schedule.startMinute - GRID_START
  const height = Math.max(schedule.endMinute - schedule.startMinute, MIN_HEIGHT)

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
        'rounded px-1 overflow-hidden cursor-pointer select-none transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      {isVisible && (
        <p className="text-white text-[0.6rem] font-medium leading-tight truncate pt-0.5">
          {schedule.title}
        </p>
      )}
    </div>
  )
}
