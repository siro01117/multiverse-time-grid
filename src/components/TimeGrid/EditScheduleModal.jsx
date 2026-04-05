import { useState } from 'react'
import { X } from 'lucide-react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

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

export default function EditScheduleModal({ schedule, roles, onSave, onClose }) {
  const [title, setTitle] = useState(schedule.title)
  const [roleId, setRoleId] = useState(schedule.roleId)
  const [day, setDay] = useState(schedule.day ?? 0)
  const [startTime, setStartTime] = useState(minutesToTime(schedule.startMinute))
  const [endTime, setEndTime] = useState(minutesToTime(schedule.endMinute))
  const [memo, setMemo] = useState(schedule.memo ?? '')

  const selectedRole = roles.find(r => r.id === roleId)
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const isValid = roleId && title.trim() && endMin > startMin

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSave(schedule.id, {
      title: title.trim(),
      roleId,
      day,
      startMinute: startMin,
      endMinute: endMin,
      memo,
      color: selectedRole?.color ?? schedule.color,
    })
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            일정 수정 <span className="text-gray-400 font-normal text-sm">({DAYS[day]})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">역할</label>
            <select
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">요일</label>
            <DaySelectorSingle selected={day} onChange={setDay} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">시작</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">종료</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          {endMin <= startMin && endTime && startTime && (
            <p className="text-xs text-red-500">종료 시간은 시작 시간보다 늦어야 합니다.</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              메모 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value.slice(0, 100))}
              placeholder="메모 입력 (최대 100자)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            />
            <p className="text-right text-xs text-gray-400">{memo.length}/100</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: selectedRole?.color ?? '#6B7280' }}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
