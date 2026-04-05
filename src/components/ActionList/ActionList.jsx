import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Pencil } from 'lucide-react'
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

// 다중 선택 (AddForm용)
function DaySelector({ selected, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {DAYS.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(
            selected.includes(i)
              ? selected.filter(x => x !== i)
              : [...selected, i]
          )}
          className={`w-7 h-7 rounded-full text-xs font-medium transition-colors
            ${selected.includes(i)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

// 단일 선택 (EditForm용)
function DaySelectorSingle({ selected, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {DAYS.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`w-7 h-7 rounded-full text-xs font-medium transition-colors
            ${selected === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

function AddForm({ roles, onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
  const [memo, setMemo] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const isValid = title.trim() && roleId &&
    (!isScheduled || (selectedDays.length > 0 && endMin > startMin))
  const selectedColor = roles.find(r => r.id === roleId)?.color ?? '#ccc'

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ title: title.trim(), roleId, memo, isScheduled, selectedDays, startMin, endMin })
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
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
          <DaySelector selected={selectedDays} onChange={setSelectedDays} />
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
          저장
        </button>
      </div>
    </form>
  )
}

function EditForm({ roles, initial, onSubmit, onCancel }) {
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
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
          <DaySelectorSingle selected={Number(day)} onChange={setDay} />
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
          저장
        </button>
      </div>
    </form>
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

function ScheduleItem({ schedule, role, onToggle, onEdit, onDelete, draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      className={`flex items-start gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-100 transition-colors group
        ${isDragOver ? 'border-t-2 border-t-blue-400' : ''}`}
    >
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
        {draggable && (
          <span className="text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 text-xs select-none">⠿</span>
        )}
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

export default function ActionList({ isOpen, onToggle, isMobile }) {
  const { roles, schedules, addSchedule, addScheduleBatch, updateSchedule, deleteSchedule } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [floatingOpen, setFloatingOpen] = useState(true)
  const [scheduledOpen, setScheduledOpen] = useState(true)
  const [floatingOrder, setFloatingOrder] = useState([])
  const [dragOverId, setDragOverId] = useState(null)
  const dragId = useRef(null)

  const visibleRoleIds = new Set(roles.filter(r => r.isVisible).map(r => r.id))

  const scheduledItems = schedules
    .filter(s => s.day !== null && visibleRoleIds.has(s.roleId))
    .sort((a, b) => a.day !== b.day ? a.day - b.day : a.startMinute - b.startMinute)

  const floatingItems = schedules
    .filter(s => s.day === null && visibleRoleIds.has(s.roleId))
    .sort((a, b) => {
      const ai = roles.findIndex(r => r.id === a.roleId)
      const bi = roles.findIndex(r => r.id === b.roleId)
      return ai - bi
    })

  useEffect(() => {
    setFloatingOrder(prev => {
      const prevIds = new Set(prev)
      const newIds = floatingItems.map(s => s.id)
      return [
        ...prev.filter(id => newIds.includes(id)),
        ...newIds.filter(id => !prevIds.has(id)),
      ]
    })
  }, [floatingItems.map(s => s.id).join(',')])

  const orderedFloating = floatingOrder
    .map(id => floatingItems.find(s => s.id === id))
    .filter(Boolean)

  const allVisible = [...scheduledItems, ...floatingItems]
  const doneCount = allVisible.filter(s => s.isDone).length
  const totalCount = allVisible.length

  const groupedScheduled = Array.from({ length: 7 }, (_, i) =>
    scheduledItems.filter(s => s.day === i)
  )

  function handleAdd({ title, roleId, memo, isScheduled, selectedDays, startMin, endMin }) {
    if (isScheduled && selectedDays.length > 0) {
      addScheduleBatch(
        selectedDays.map(d => ({
          title, roleId, memo,
          day: d, startMinute: startMin, endMinute: endMin, isDone: false,
        }))
      )
    } else {
      addSchedule({ title, roleId, memo, day: null, startMinute: null, endMinute: null, isDone: false })
    }
    setShowForm(false)
  }

  function handleEdit(id, data) {
    updateSchedule(id, data)
    setEditingId(null)
  }

  function handleDragStart(id) {
    dragId.current = id
    setDragOverId(null)
  }
  function handleDragOver(e, id) {
    e.preventDefault()
    setDragOverId(id)
  }
  function handleDrop(targetId) {
    if (!dragId.current || dragId.current === targetId) return
    setFloatingOrder(prev => {
      const from = prev.indexOf(dragId.current)
      const to = prev.indexOf(targetId)
      const next = [...prev]
      next.splice(from, 1)
      next.splice(to, 0, dragId.current)
      return next
    })
    dragId.current = null
    setDragOverId(null)
  }
  function handleDragEnd() {
    dragId.current = null
    setDragOverId(null)
  }

  function renderFloatingItem(sched) {
    const role = roles.find(r => r.id === sched.roleId)
    if (editingId === sched.id) {
      return (
        <EditForm
          key={sched.id}
          roles={roles}
          initial={buildInitial(sched)}
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
        draggable
        onDragStart={() => handleDragStart(sched.id)}
        onDragOver={e => handleDragOver(e, sched.id)}
        onDrop={() => handleDrop(sched.id)}
        onDragEnd={handleDragEnd}
        isDragOver={dragOverId === sched.id}
        onToggle={() => updateSchedule(sched.id, { isDone: !sched.isDone })}
        onEdit={() => { setEditingId(sched.id); setShowForm(false) }}
        onDelete={() => deleteSchedule(sched.id)}
      />
    )
  }

  function renderScheduledItem(sched) {
    const role = roles.find(r => r.id === sched.roleId)
    if (editingId === sched.id) {
      return (
        <EditForm
          key={sched.id}
          roles={roles}
          initial={buildInitial(sched)}
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

  const bodyContent = isOpen && (
    <div className="flex-1 overflow-y-auto">
      {/* Floating section */}
      <div>
        <button
          onClick={() => setFloatingOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
        >
          <span>Floating</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${floatingOpen ? '' : '-rotate-90'}`} />
        </button>
        {floatingOpen && (
          floatingItems.length === 0
            ? <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
            : orderedFloating.map(renderFloatingItem)
        )}
      </div>

      <div className="border-t border-gray-100 my-2" />

      {/* Scheduled section */}
      <div>
        <button
          onClick={() => setScheduledOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
        >
          <span>Scheduled</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${scheduledOpen ? '' : '-rotate-90'}`} />
        </button>
        {scheduledOpen && (
          scheduledItems.length === 0
            ? <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
            : groupedScheduled.map((group, dayIdx) => {
                if (group.length === 0) return null
                return (
                  <div key={dayIdx}>
                    <div className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-50 border-y border-gray-100">
                      {DAYS[dayIdx]}요일
                    </div>
                    {group.map(renderScheduledItem)}
                  </div>
                )
              })
        )}
      </div>
    </div>
  )

  const header = (
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
  )

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        <aside
          style={{
            position: 'fixed',
            bottom: 48,
            left: 0,
            right: 0,
            height: '50dvh',
            zIndex: 40,
            transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.25s ease',
            borderRadius: '16px 16px 0 0',
          }}
          className="bg-white shadow-xl flex flex-col border-t border-gray-200"
        >
          <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-800">Action List</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{doneCount} / {totalCount}</span>
              <button
                onClick={() => { setShowForm(v => !v); setEditingId(null) }}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                {showForm ? '닫기' : '+ 추가'}
              </button>
            </div>
          </div>
          {showForm && (
            <AddForm roles={roles} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          )}
          <div className="flex-1 overflow-y-auto">
            <div>
              <button
                onClick={() => setFloatingOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
              >
                <span>Floating</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${floatingOpen ? '' : '-rotate-90'}`} />
              </button>
              {floatingOpen && (
                floatingItems.length === 0
                  ? <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
                  : orderedFloating.map(renderFloatingItem)
              )}
            </div>
            <div className="border-t border-gray-100 my-2" />
            <div>
              <button
                onClick={() => setScheduledOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
              >
                <span>Scheduled</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${scheduledOpen ? '' : '-rotate-90'}`} />
              </button>
              {scheduledOpen && (
                scheduledItems.length === 0
                  ? <p className="px-3 pb-2 text-xs text-gray-300">없음</p>
                  : groupedScheduled.map((group, dayIdx) => {
                      if (group.length === 0) return null
                      return (
                        <div key={dayIdx}>
                          <div className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-50 border-y border-gray-100">
                            {DAYS[dayIdx]}요일
                          </div>
                          {group.map(renderScheduledItem)}
                        </div>
                      )
                    })
              )}
            </div>
          </div>
        </aside>
        {isOpen && (
          <div className="fixed inset-0 bg-black/20 z-30" onClick={onToggle} />
        )}
      </>
    )
  }

  // Desktop: sidebar
  return (
    <aside
      className={`no-print flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full transition-all duration-200 ${isOpen ? 'w-72' : 'w-8'}`}
    >
      {header}
      {isOpen && showForm && (
        <AddForm roles={roles} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {bodyContent}
    </aside>
  )
}
