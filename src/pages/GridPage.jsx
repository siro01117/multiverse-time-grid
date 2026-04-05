import { useState, useEffect } from 'react'
import { AppProvider } from '../store/AppContext'
import { useAppContext } from '../store/AppContext'
import { Menu, ListTodo } from 'lucide-react'
import FilterBar from '../components/FilterBar/FilterBar'
import RoleManager from '../components/RoleManager/RoleManager'
import TimeGrid from '../components/TimeGrid/TimeGrid'
import ActionList from '../components/ActionList/ActionList'
import LoadingScreen from '../components/LoadingScreen'

function useIsMobile() {
  const [is, setIs] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIs(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return is
}

function Layout() {
  const { undo, isLoading } = useAppContext()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [actionOpen, setActionOpen] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const id = setTimeout(() => setMinDelayDone(true), 1000)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!isLoading && minDelayDone && showLoading) {
      setFadingOut(true)
      const id = setTimeout(() => setShowLoading(false), 600)
      return () => clearTimeout(id)
    }
  }, [isLoading, minDelayDone])

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

  if (showLoading) return <LoadingScreen fadingOut={fadingOut} />

  return (
    <div
      className="flex flex-col h-screen bg-gray-50"
      style={{ animation: 'gridFadeIn 0.5s ease forwards' }}
    >
      {/* Header */}
      <header className="no-print flex items-center px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Multiverse</span>
          <span className="text-lg font-light text-gray-400">Time-Grid</span>
        </div>
      </header>

      {/* FilterBar */}
      <div className="no-print">
        <FilterBar />
      </div>

      {/* Body */}
      <div className={`flex flex-1 min-h-0 ${isMobile ? 'pb-12' : ''} ${!sidebarOpen && !actionOpen && !isMobile ? 'justify-center' : ''}`}>
        <RoleManager
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          isMobile={isMobile}
        />
        <TimeGrid />
        <ActionList
          isOpen={actionOpen}
          onToggle={() => setActionOpen(p => !p)}
          isMobile={isMobile}
        />
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div className="no-print fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="flex-1 py-3 text-xs text-gray-500 flex flex-col items-center gap-1"
          >
            <Menu size={18} />
            역할
          </button>
          <button
            onClick={() => setActionOpen(v => !v)}
            className="flex-1 py-3 text-xs text-gray-500 flex flex-col items-center gap-1"
          >
            <ListTodo size={18} />
            할일
          </button>
        </div>
      )}
    </div>
  )
}

export default function GridPage() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
