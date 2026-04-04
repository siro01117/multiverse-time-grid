import { useState, useEffect } from 'react'
import { AppProvider } from './store/AppContext'
import { useAppContext } from './store/AppContext'
import FilterBar from './components/FilterBar/FilterBar'
import RoleManager from './components/RoleManager/RoleManager'
import TimeGrid from './components/TimeGrid/TimeGrid'
import ActionList from './components/ActionList/ActionList'

function Layout() {
  const { undo, isLoading } = useAppContext()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [actionOpen, setActionOpen] = useState(true)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo])

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen text-sm text-gray-400">
      불러오는 중...
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Multiverse</span>
          <span className="text-lg font-light text-gray-400">Time-Grid</span>
        </div>
      </header>

      {/* FilterBar */}
      <FilterBar />

      {/* Body */}
      <div className={`flex flex-1 min-h-0 ${!sidebarOpen && !actionOpen ? 'justify-center' : ''}`}>
        <RoleManager isOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
        <TimeGrid />
        <ActionList isOpen={actionOpen} onToggle={() => setActionOpen(p => !p)} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
