import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppContext } from '../../store/AppContext'
import RoleItem from './RoleItem'
import AddRoleModal from './AddRoleModal'

export default function RoleManager() {
  const { roles, addRole, updateRole, deleteRole } = useAppContext()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">역할</span>
          <button
            onClick={() => setShowModal(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="역할 추가"
          >
            <Plus size={15} />
          </button>
        </div>

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

        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus size={13} />
            역할 추가
          </button>
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
