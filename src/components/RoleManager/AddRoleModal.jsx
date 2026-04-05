import { useState, useRef } from 'react'
import { X } from 'lucide-react'

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#22C55E', '#10B981', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899',
]

export default function AddRoleModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[6])
  const customInputRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim().slice(0, 12), color })
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
          <h2 className="text-base font-semibold text-gray-800">역할 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              역할 이름 <span className="text-gray-400">(최대 12자)</span>
            </label>
            <input
              type="text"
              value={name}
              maxLength={12}
              onChange={e => setName(e.target.value)}
              placeholder="역할 이름 입력"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{name.length}/12</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">색상</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#1f2937' : 'transparent',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => customInputRef.current?.click()}
                className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors text-xs"
                style={
                  !PRESET_COLORS.includes(color)
                    ? { backgroundColor: color, borderColor: '#1f2937', borderStyle: 'solid' }
                    : {}
                }
              >
                {PRESET_COLORS.includes(color) ? '+' : ''}
              </button>
              <span className="text-xs text-gray-400">커스텀 색상</span>
              <input
                ref={customInputRef}
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="sr-only"
              />
            </div>
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
              disabled={!name.trim()}
              className="flex-1 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: color }}
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
