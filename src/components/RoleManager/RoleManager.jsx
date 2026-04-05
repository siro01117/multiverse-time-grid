import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppContext } from '../../store/AppContext'
import RoleItem from './RoleItem'
import AddRoleModal from './AddRoleModal'

export default function RoleManager({ isOpen, onToggle }) {
  const { roles, addRole, updateRole, deleteRole, schedules } = useAppContext()
  const [showModal, setShowModal] = useState(false)

  // Weekly stats (visible roles only)
  const visibleRoleIds = new Set(roles.filter(r => r.isVisible).map(r => r.id))
  const visibleSchedules = schedules.filter(
    s => visibleRoleIds.has(s.roleId) && s.startMinute !== null && s.endMinute !== null
  )
  const totalMin = visibleSchedules.reduce((sum, s) => sum + (s.endMinute - s.startMinute), 0)
  const totalH = Math.floor(totalMin / 60)
  const totalM = totalMin % 60
  const avgMin = Math.round(totalMin / 7)
  const avgH = Math.floor(avgMin / 60)
  const avgM = avgMin % 60

  return (
    <>
      <aside
        className={`no-print flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-200 ${isOpen ? 'w-40' : 'w-8'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-gray-100 flex-shrink-0">
          {isOpen && (
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">역할</span>
          )}
          <div className={`flex items-center gap-1 ${isOpen ? '' : 'w-full justify-center'}`}>
            {isOpen && (
              <button
                onClick={() => setShowModal(true)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="역할 추가"
              >
                <Plus size={15} />
              </button>
            )}
            <button
              onClick={onToggle}
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        <div className={isOpen ? '' : 'hidden'}>
          {/* Stats section */}
          <div className="px-3 py-2 border-b border-gray-100 space-y-1">
            <p className="text-[0.6rem] font-semibold text-gray-400 uppercase tracking-wide">이번 주</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">총합산</span>
              <span className="font-medium text-gray-700">{totalH}h {totalM}m</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">일평균</span>
              <span className="font-medium text-gray-700">{avgH}h {avgM}m</span>
            </div>
          </div>

          {/* Role list */}
          <div className="flex-1 overflow-y-auto px-1 py-2 space-y-0.5">
            {roles.length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-4">역할이 없습니다</p>
            ) : (
              roles.map(role => (
                <RoleItem
                  key={role.id}
                  role={role}
                  onUpdate={updateRole}
                  onDelete={deleteRole}
                />
              ))
            )}
          </div>

          {/* Add role button */}
          <div className="px-3 py-3 border-t border-gray-100">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus size={13} />
              역할 추가
            </button>
          </div>
        </div>
      </aside>

      {showModal && (
        <AddRoleModal
          onAdd={addRole}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
