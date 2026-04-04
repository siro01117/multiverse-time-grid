import { useState, useEffect } from 'react'
import { loadRoles, saveRoles } from '../utils/localStorage'

const DEFAULT_ROLES = []

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useRoles() {
  const [roles, setRoles] = useState(() => loadRoles() ?? DEFAULT_ROLES)

  useEffect(() => {
    saveRoles(roles)
  }, [roles])

  function addRole({ name, color }) {
    const trimmed = name.trim().slice(0, 12)
    if (!trimmed) return
    setRoles(prev => [
      ...prev,
      { id: generateId(), name: trimmed, color, isVisible: true },
    ])
  }

  function updateRole(id, updates) {
    setRoles(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  function deleteRole(id) {
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  function toggleRoleVisibility(id) {
    setRoles(prev =>
      prev.map(r => (r.id === id ? { ...r, isVisible: !r.isVisible } : r))
    )
  }

  function toggleAllVisibility() {
    const allVisible = roles.every(r => r.isVisible)
    setRoles(prev => prev.map(r => ({ ...r, isVisible: !allVisible })))
  }

  return {
    roles,
    addRole,
    updateRole,
    deleteRole,
    toggleRoleVisibility,
    toggleAllVisibility,
  }
}
