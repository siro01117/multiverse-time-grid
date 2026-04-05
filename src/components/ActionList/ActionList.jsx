import { useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useAppContext } from '../../store/AppContext'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0')
  const m = (min % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Shared form layout used by both Add and Edit
function TodoForm({ roles, initial, submitLabel, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial.title)
  const [roleId, setRoleId] = useState(initial.roleId)
  const [memo, setMemo] = useState(initial.memo)
  const [isScheduled, setIsScheduled] = useState(initial.isScheduled)
  const [day, setDay] = useState(initial.day ?? 0)
  const [startTime, setStartTime] = useState(initial.startTime)
  const [endTime, setEndTime] = useState(initial.endTime)

  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const isValid = title.trim() && roleId && (!isScheduled || endMin > startMin)
  const selectedColor = roles.find(r => r.id === roleId)?.color ?? '#ccc'

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSubmit({
      title: title.trim(),
      roleId,
      memo,
      day: isScheduled ? Number(day) : null,
      startMinute: isScheduled ? startMin : null,
      endMinute: isScheduled ? endMin : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="px-3 py-3 border-b border-gray-100 bg-gray-50 space-y-2">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="제목 입력"
        autoFocus
        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      <textarea
        value={memo}
        onChange={e => setMemo(e.target.value)}
        placeholder="메모 (선택)"
        rows={2}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      <div className="flex items-center gap-2">
        <div style={{ backgroundColor: selectedColor }} className="w-4 h-4 rounded-full flex-shrink-0" />
        <select
          value={roleId}
          onChange={e => setRoleId(e.target.value)}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">역할 선택</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isScheduled}
          onChange={e => setIsScheduled(e.target.checked)}
          className="accent-blue-500"
        />
        <span className="text-xs text-gray-600">시간 지정 (Scheduled)</span>
      </label>

      {isScheduled && (
        <div className="space-y-2">
          <select
            value={day}
            onChange={e => setDay(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            {DAYS.map((d, i) => (
              <option key={i} value={i}>{d}요일</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          {endMin <= startMin && (
            <p className="text-[0.65rem] text-red-500">종료 시간은 시작 시간보다 늦어야 합니다.</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function ScheduleItem({ schedule, role, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 transition-colors group">
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: role?.color ?? '#ccc' }}
      />
      <input
        type="checkbox"
        checked={!!schedule.isDone}
        onChange={onToggle}
        className="mt-0.5 flex-shrink-0 accent-blue-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${schedule.isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {schedule.title}
        </p>
        {schedule.startMinute !== null && (
          <p className="text-xs text-gray-400">
            {minutesToTime(schedule.startMinute)} ~ {minutesToTime(schedule.endMinute)}
          </p>
        )}
        {schedule.memo && (
          <p className="text-xs text-gray-400 truncate">{schedule.memo}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        <button
          onClick={onEdit}
          className="text-gray-300 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
          title="수정"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-400 text-xs transition-colors"
          title="삭제"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function buildInitial(schedule) {
  const isScheduled = schedule.day !== null
  return {
    title: schedule.title ?? '',
    roleId: schedule.roleId ?? '',
    memo: schedule.memo ?? '',
    isScheduled,
    day: schedule.day ?? 0,
    startTime: schedule.startMinute !== null ? minutesToTime(schedule.startMinute) : '09:00',
    endTime: schedule.endMinute !== null ? minutesToTime(schedule.endMinute) : '10:00',
  }
}

export default function ActionList({ isOpen, onToggle }) {
  const { roles, schedules, addSchedule, updateSchedule, deleteSchedule } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const visibleRoleIds = new Set(roles.filter(r => r.isVisible).map(r => r.id))

  const scheduledItems = schedules
    .filter(s => s.day !== null && visibleRoleIds.has(s.roleId))
    .sort((a, b) => a.day !== b.day ? a.day - b.day : a.startMinute - b.startMinute)

  const floatingItems = schedules.filter(s => s.day === null)

  const allVisible = [...scheduledItems, ...floatingItems]
  const doneCount = allVisible.filter(s => s.isDone).length
  const totalCount = allVisible.length

  const groupedScheduled = Array.from({ length: 7 }, (_, i) =>
    scheduledItems.filter(s => s.day === i)
  )

  function handleAdd(data) {
    addSchedule({ ...data, isDone: false })
    setShowForm(false)
  }

  function handleEdit(id, data) {
    updateSchedule(id, data)
    setEditingId(null)
  }

  function renderItem(sched) {
    const role = roles.find(r => r.id === sched.roleId)
    if (editingId === sched.id) {
      return (
        <TodoForm
          key={sched.id}
          roles={roles}
          initial={buildInitial(sched)}
          submitLabel="저장"
          onSubmit={data => handleEdit(sched.id, data)}
          onCancel={() => setEditingId(null)}
        />
      )
    }
    return (
      <ScheduleItem
        key={sched.id}
        schedule={sched}
        role={role}
        onToggle={() => updateSchedule(sched.id, { isDone: !sched.isDone })}
        onEdit={() => { setEditingId(sched.id); setShowForm(false) }}
        onDelete={() => deleteSchedule(sched.id)}
      />
    )
  }

  return (
    <aside
      className={`no-print flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full transition-all duration-200 ${isOpen ? 'w-72' : 'w-8'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {isOpen && (
          <>
            <div className="flex items-center gap-2 flex-1 ml-2">
              <span className="text-sm font-semibold text-gray-800">Action List</span>
              <span className="text-xs text-gray-400">{doneCount} / {totalCount}</span>
            </div>
            <button
              onClick={() => { setShowForm(v => !v); setEditingId(null) }}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              {showForm ? '닫기' : '+ 추가'}
            </button>
          </>
        )}
      </div>

      {/* Add form */}
      {isOpen && showForm && (
        <TodoForm
          roles={roles}
          initial={{ title: '', roleId: roles[0]?.id ?? '', memo: '', isScheduled: false, day: 0, startTime: '09:00', endTime: '10:00' }}
          submitLabel="저장"
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Body */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto">
          {/* Scheduled section */}
          <div className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Scheduled
          </div>
          {scheduledItems.length === 0 ? (
            <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
          ) : (
            groupedScheduled.map((group, dayIdx) => {
              if (group.length === 0) return null
              return (
                <div key={dayIdx}>
                  <div className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-50 border-y border-gray-100">
                    {DAYS[dayIdx]}요일
                  </div>
                  {group.map(renderItem)}
                </div>
              )
            })
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Floating section */}
          <div className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Floating
          </div>
          {floatingItems.length === 0 ? (
            <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
          ) : (
            floatingItems.map(renderItem)
          )}
        </div>
      )}
    </aside>
  )
}
