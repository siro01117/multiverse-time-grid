import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

function toCamel(row) {
  return { id: row.id, name: row.name, color: row.color, isVisible: row.is_visible }
}

export function useRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('roles').select('*').order('created_at')
      .then(({ data, error }) => {
        if (!error) setRoles(data.map(toCamel))
        else console.error('useRoles fetch error:', error)
        setLoading(false)
      })

    const channel = supabase
      .channel('roles-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'roles' },
        ({ new: row }) => setRoles(prev =>
          prev.some(r => r.id === row.id) ? prev : [...prev, toCamel(row)]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'roles' },
        ({ new: row }) => setRoles(prev => prev.map(r => r.id === row.id ? toCamel(row) : r)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'roles' },
        ({ old: row }) => setRoles(prev => prev.filter(r => r.id !== row.id)))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addRole({ name, color }) {
    const trimmed = name.trim().slice(0, 12)
    if (!trimmed) return
    const tempId = `temp-${Date.now()}`
    setRoles(prev => [...prev, { id: tempId, name: trimmed, color, isVisible: true }])
    try {
      const { data, error } = await supabase
        .from('roles').insert({ name: trimmed, color, is_visible: true }).select().single()
      if (error) throw error
      setRoles(prev => prev.map(r => r.id === tempId ? toCamel(data) : r))
    } catch (err) {
      console.error('addRole error:', err)
      setRoles(prev => prev.filter(r => r.id !== tempId))
    }
  }

  async function updateRole(id, updates) {
    const dbUpdates = {}
    if ('name' in updates) dbUpdates.name = updates.name
    if ('color' in updates) dbUpdates.color = updates.color
    if ('isVisible' in updates) dbUpdates.is_visible = updates.isVisible
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    try {
      const { error } = await supabase.from('roles').update(dbUpdates).eq('id', id)
      if (error) throw error
    } catch (err) { console.error('updateRole error:', err) }
  }

  async function deleteRole(id) {
    setRoles(prev => prev.filter(r => r.id !== id))
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id)
      if (error) throw error
    } catch (err) { console.error('deleteRole error:', err) }
  }

  function toggleRoleVisibility(id) {
    const role = roles.find(r => r.id === id)
    if (!role) return
    updateRole(id, { isVisible: !role.isVisible })
  }

  async function toggleAllVisibility() {
    const allVisible = roles.every(r => r.isVisible)
    setRoles(prev => prev.map(r => ({ ...r, isVisible: !allVisible })))
    try {
      await Promise.all(roles.map(r =>
        supabase.from('roles').update({ is_visible: !allVisible }).eq('id', r.id)
      ))
    } catch (err) { console.error('toggleAllVisibility error:', err) }
  }

  return { roles, loading, addRole, updateRole, deleteRole, toggleRoleVisibility, toggleAllVisibility }
}
