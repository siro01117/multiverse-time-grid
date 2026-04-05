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

function generateGroupId() {
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function AddScheduleModal({ onAddBatch, onClose, dayIdx, initialStartMinute, roles }) {
  const [title, setTitle] = useState('')
  const [roleId, setRoleId] = useState('')
  const [startTime, setStartTime] = useState(minutesToTime(initialStartMinute))
  const [endTime, setEndTime] = useState(minutesToTime(Math.min(initialStartMinute + 60, 1439)))
  const [memo, setMemo] = useState('')
  const [selectedDays, setSelectedDays] = useState([dayIdx])

  const selectedRole = roles.find(r => r.id === roleId)
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const isValid = roleId && title.trim() && endMin > startMin && selectedDays.length > 0

  function toggleDay(idx) {
    setSelectedDays(prev => {
      if (prev.includes(idx)) {
        return prev.length > 1 ? prev.filter(d => d !== idx) : prev
      }
      return [...prev, idx]
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    const groupId = selectedDays.length > 1 ? generateGroupId() : null
    const batch = selectedDays.map(day => ({
      roleId,
      title: title.trim(),
      day,
      startMinute: startMin,
      endMinute: endMin,
      isRecurring: false,
      color: selectedRole.color,
      memo,
      groupId,
    }))
    onAddBatch(batch)
    onClose()
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
          <h2 className="text-base font-semibold text-gray-800">일정 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">요일</label>
            <div className="flex gap-1">
              {DAYS.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={[
                    'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
                    selectedDays.includes(idx)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300',
                  ].join(' ')}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="일정 제목 입력"
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
              <option value="">역할 선택</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
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
