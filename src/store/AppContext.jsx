import { createContext, useContext } from 'react'
import { useRoles } from '../hooks/useRoles'
import { useSchedules } from '../hooks/useSchedules'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const rolesState = useRoles()
  const schedulesState = useSchedules()
  const isLoading = rolesState.loading || schedulesState.loading

  return (
    <AppContext.Provider value={{ ...rolesState, ...schedulesState, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
