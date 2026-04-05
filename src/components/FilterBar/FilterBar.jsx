import { useAppContext } from '../../store/AppContext'

export default function FilterBar() {
  const { roles, toggleRoleVisibility, toggleAllVisibility } = useAppContext()

  const allVisible = roles.every(r => r.isVisible)
  const noneVisible = roles.every(r => !r.isVisible)

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-wrap">
      <span className="text-xs font-medium text-gray-400 mr-1">필터</span>

      {roles.map(role => (
        <button
          key={role.id}
          onClick={() => toggleRoleVisibility(role.id)}
          className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
          style={
            role.isVisible
              ? {
                  backgroundColor: role.color,
                  borderColor: role.color,
                  color: '#ffffff',
                }
              : {
                  backgroundColor: 'transparent',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                }
          }
        >
          {role.name}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={toggleAllVisibility}
          className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {allVisible ? '전체 숨기기' : noneVisible ? '전체 보기' : '전체 보기'}
        </button>
      </div>
    </div>
  )
}
