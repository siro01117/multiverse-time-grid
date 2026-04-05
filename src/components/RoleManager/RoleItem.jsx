import { useRef, useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'

export default function RoleItem({ role, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(role.name)
  const colorInputRef = useRef(null)

  function handleColorClick() {
    colorInputRef.current?.click()
  }

  function handleColorChange(e) {
    onUpdate(role.id, { color: e.target.value })
  }

  function handleEditSubmit() {
    const trimmed = editName.trim().slice(0, 12)
    if (trimmed) onUpdate(role.id, { name: trimmed })
    setIsEditing(false)
  }

  function handleEditCancel() {
    setEditName(role.name)
    setIsEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleEditSubmit()
    if (e.key === 'Escape') handleEditCancel()
  }

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <button
        onClick={handleColorClick}
        className="w-4 h-4 rounded-full flex-shrink-0 ring-0 hover:ring-2 hover:ring-offset-1 transition-all"
        style={{ backgroundColor: role.color, '--tw-ring-color': role.color }}
        title="색상 변경"
      />
      <input
        ref={colorInputRef}
        type="color"
        value={role.color}
        onChange={handleColorChange}
        className="sr-only"
      />

      {isEditing ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            type="text"
            value={editName}
            maxLength={12}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 min-w-0 text-sm px-1 py-0.5 border border-blue-400 rounded focus:outline-none"
          />
          <button onClick={handleEditSubmit} className="text-green-500 hover:text-green-600">
            <Check size={14} />
          </button>
          <button onClick={handleEditCancel} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-700 truncate">{role.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => { setEditName(role.name); setIsEditing(true) }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="이름 수정"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(role.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="역할 삭제"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
