import { useEffect, useRef } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export default function ScheduleDetailPopup({ schedule, role, position, onClose, onEdit, onDelete }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  // Adjust position to stay within viewport after first render
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let x = position.x
    let y = position.y
    if (x + rect.width > vw - 8) x = vw - rect.width - 8
    if (y + rect.height > vh - 8) y = vh - rect.height - 8
    if (x < 8) x = 8
    if (y < 8) y = 8
    el.style.left = x + 'px'
    el.style.top = y + 'px'
  }, [position])

  function handleDelete() {
    if (schedule.groupId) {
      if (window.confirm('같이 생성된 다른 요일 일정도 삭제할까요?')) {
        onDelete({ type: 'group', groupId: schedule.groupId })
      } else {
        onDelete({ type: 'single', id: schedule.id })
      }
    } else {
      onDelete({ type: 'single', id: schedule.id })
    }
  }

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: position.x, top: position.y, zIndex: 100 }}
      className="bg-white rounded-xl shadow-xl w-60 overflow-hidden border border-gray-100"
    >
      <div style={{ backgroundColor: role?.color ?? '#6B7280', height: '6px' }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 leading-tight flex-1 mr-2">
            {schedule.title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {DAYS[schedule.day]}요일 {formatTime(schedule.startMinute)} ~ {formatTime(schedule.endMinute)}
        </p>
        {schedule.memo && (
          <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2 whitespace-pre-wrap break-words">
            {schedule.memo}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Pencil size={11} /> 수정
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={11} /> 삭제
          </button>
        </div>
      </div>
    </div>
  )
}
