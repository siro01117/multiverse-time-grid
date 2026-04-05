import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppContext } from '../../store/AppContext'
import TimeBlock from './TimeBlock'
import AddScheduleModal from './AddScheduleModal'
import EditScheduleModal from './EditScheduleModal'
import ScheduleDetailPopup from './ScheduleDetailPopup'
import Toast from './Toast'
import { Printer } from 'lucide-react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6~23
const GRID_START = 360  // 06:00 in minutes
const COL_WIDTH = 100   // px per day column
const TIME_AXIS_WIDTH = 48 // px
const MIN_ROW = 30
const MAX_ROW = 90
const STEP = 15

export default function TimeGrid() {
  const { roles, schedules, addScheduleBatch, updateSchedule, deleteSchedule, deleteScheduleGroup } = useAppContext()
  const [rowHeight, setRowHeight] = useState(60)
  const [addModal, setAddModal] = useState(null)
  const [detailPopup, setDetailPopup] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const mainRef = useRef(null)
  const lastPinchDist = useRef(null)

  function handlePinch(e) {
    if (e.touches.length !== 2) return
    e.preventDefault()
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    if (lastPinchDist.current !== null) {
      const delta = dist - lastPinchDist.current
      setRowHeight(h => Math.min(MAX_ROW, Math.max(MIN_ROW, h + delta * 0.25)))
    }
    lastPinchDist.current = dist
  }

  function handlePinchEnd(e) {
    if (e.touches.length < 2) lastPinchDist.current = null
  }

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.addEventListener('touchmove', handlePinch, { passive: false })
    return () => el.removeEventListener('touchmove', handlePinch)
  }, [rowHeight])

  function handleBlockClick(e, schedule, role) {
    e.stopPropagation()
    setDetailPopup({ schedule, role, x: e.clientX + 8, y: e.clientY - 30 })
  }

  function handleColumnClick(e, dayIdx) {
    if (roles.length === 0) {
      setToastMessage('역할을 먼저 추가해주세요')
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const startMinute = Math.floor(offsetY / rowHeight) * 60 + GRID_START
    setAddModal({ dayIdx, startMinute })
  }

  function handleDelete({ type, id, groupId }) {
    if (type === 'group') {
      deleteScheduleGroup(groupId)
    } else {
      deleteSchedule(id)
    }
    setDetailPopup(null)
  }

  function handleEdit() {
    if (!detailPopup) return
    setEditModal(detailPopup.schedule)
    setDetailPopup(null)
  }

  const handleHideToast = useCallback(() => setToastMessage(null), [])

  const totalWidth = TIME_AXIS_WIDTH + COL_WIDTH * DAYS.length

  return (
    <main ref={mainRef} onTouchEnd={handlePinchEnd} className="flex-1 overflow-y-auto overflow-x-auto print-main">
      <div style={{ minWidth: `${totalWidth}px` }} className="print-grid-wrapper">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center print-grid-header">
          <div style={{ width: `${TIME_AXIS_WIDTH}px`, flexShrink: 0 }} />
          {DAYS.map(day => (
            <div
              key={day}
              style={{ width: `${COL_WIDTH}px`, minWidth: `${COL_WIDTH}px` }}
              className="print-day-col text-center text-xs font-medium text-gray-500 py-2 border-l border-gray-100"
            >
              {day}
            </div>
          ))}
          {/* Zoom controls */}
          <div className="no-print flex items-center gap-1 px-2 border-l border-gray-100 ml-auto">
            <button
              onClick={() => setRowHeight(h => Math.max(MIN_ROW, h - STEP))}
              className="text-xs text-gray-400 hover:text-gray-700 px-1 transition-colors"
            >
              −
            </button>
            <span className="text-xs text-gray-400 w-6 text-center">{rowHeight}</span>
            <button
              onClick={() => setRowHeight(h => Math.min(MAX_ROW, h + STEP))}
              className="text-xs text-gray-400 hover:text-gray-700 px-1 transition-colors"
            >
              +
            </button>
          </div>
          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 px-3 py-1 mr-2
                       text-xs text-gray-500 border border-gray-200 rounded-lg
                       hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <Printer size={13} />
            내보내기
          </button>
        </div>

        {/* Grid body */}
        <div className="flex">
          {/* Time axis */}
          <div style={{ width: `${TIME_AXIS_WIDTH}px`, flexShrink: 0 }} className="select-none">
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                style={{ height: `${rowHeight}px` }}
                className="relative flex items-start justify-end pr-1"
              >
                <span className={`text-[0.65rem] text-gray-400 ${idx === 0 ? 'mt-0.5' : '-mt-2'}`}>
                  {hour}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((day, dayIdx) => {
            const daySchedules = schedules.filter(s => s.day === dayIdx)
            return (
              <div
                key={day}
                style={{ width: `${COL_WIDTH}px`, minWidth: `${COL_WIDTH}px` }}
                className="print-day-col relative border-l border-gray-100 cursor-pointer"
                onClick={e => handleColumnClick(e, dayIdx)}
              >
                {/* Hour rows (grid lines) */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    style={{ height: `${rowHeight}px` }}
                    className="border-t border-gray-200"
                  />
                ))}
                <div className="border-t border-gray-200" />

                {/* Schedule blocks */}
                {daySchedules.map(sched => {
                  const role = roles.find(r => r.id === sched.roleId)
                  return (
                    <TimeBlock
                      key={sched.id}
                      schedule={sched}
                      role={role}
                      isVisible={role?.isVisible ?? true}
                      rowHeight={rowHeight}
                      onClick={e => handleBlockClick(e, sched, role)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {addModal && (
        <AddScheduleModal
          roles={roles}
          dayIdx={addModal.dayIdx}
          initialStartMinute={addModal.startMinute}
          onAddBatch={addScheduleBatch}
          onClose={() => setAddModal(null)}
        />
      )}

      {detailPopup && (
        <ScheduleDetailPopup
          schedule={detailPopup.schedule}
          role={detailPopup.role}
          position={{ x: detailPopup.x, y: detailPopup.y }}
          onClose={() => setDetailPopup(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {editModal && (
        <EditScheduleModal
          schedule={editModal}
          roles={roles}
          onSave={(id, updates) => { updateSchedule(id, updates); setEditModal(null) }}
          onClose={() => setEditModal(null)}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onHide={handleHideToast} />
      )}
    </main>
  )
}
