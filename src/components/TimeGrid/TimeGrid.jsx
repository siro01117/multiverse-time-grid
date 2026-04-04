import { useState, useCallback } from 'react'
import { useAppContext } from '../../store/AppContext'
import TimeBlock from './TimeBlock'
import AddScheduleModal from './AddScheduleModal'
import EditScheduleModal from './EditScheduleModal'
import ScheduleDetailPopup from './ScheduleDetailPopup'
import Toast from './Toast'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6~23
const GRID_START = 360 // 06:00 in minutes

export default function TimeGrid() {
  const { roles, schedules, addScheduleBatch, updateSchedule, deleteSchedule, deleteScheduleGroup } = useAppContext()
  const [addModal, setAddModal] = useState(null) // { dayIdx, startMinute }
  const [detailPopup, setDetailPopup] = useState(null) // { schedule, role, x, y }
  const [editModal, setEditModal] = useState(null) // schedule
  const [toastMessage, setToastMessage] = useState(null)

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
    const startMinute = Math.floor(offsetY / 60) * 60 + GRID_START
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

  return (
    <main className="flex-1 overflow-auto">
      <div className="min-w-[36rem]">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex">
          <div className="w-12 flex-shrink-0" />
          {DAYS.map(day => (
            <div
              key={day}
              className="flex-1 text-center text-xs font-medium text-gray-500 py-2 border-l border-gray-100"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="flex">
          {/* Time axis — no borders so grid lines don't bleed into this column */}
          <div className="w-12 flex-shrink-0 select-none">
            {HOURS.map((hour, idx) => (
              <div
                key={hour}
                style={{ height: '60px' }}
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
                className="flex-1 relative border-l border-gray-100 cursor-pointer"
                onClick={e => handleColumnClick(e, dayIdx)}
              >
                {/* Hour rows (grid lines) */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    style={{ height: '60px' }}
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
