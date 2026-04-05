import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

function toCamel(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isVisible: row.is_visible,
  }
}

async function fetchAll(setRoles) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at')
    if (error) throw error
    setRoles(data.map(toCamel))
  } catch (err) {
    console.error('useRoles fetch error:', err)
  }
}

export function useRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll(setRoles).then(() => setLoading(false))

    const channel = supabase
      .channel('roles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, () => {
        fetchAll(setRoles)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addRole({ name, color }) {
    const trimmed = name.trim().slice(0, 12)
    if (!trimmed) return
    try {
      const { error } = await supabase
        .from('roles')
        .insert({ name: trimmed, color, is_visible: true })
      if (error) throw error
    } catch (err) {
      console.error('addRole error:', err)
    }
  }

  async function updateRole(id, updates) {
    const dbUpdates = {}
    if ('name' in updates) dbUpdates.name = updates.name
    if ('color' in updates) dbUpdates.color = updates.color
    if ('isVisible' in updates) dbUpdates.is_visible = updates.isVisible
    try {
      const { error } = await supabase.from('roles').update(dbUpdates).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('updateRole error:', err)
    }
  }

  async function deleteRole(id) {
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('deleteRole error:', err)
    }
  }

  async function toggleRoleVisibility(id) {
    const role = roles.find(r => r.id === id)
    if (!role) return
    await updateRole(id, { isVisible: !role.isVisible })
  }

  async function toggleAllVisibility() {
    const allVisible = roles.every(r => r.isVisible)
    try {
      await Promise.all(
        roles.map(r =>
          supabase.from('roles').update({ is_visible: !allVisible }).eq('id', r.id)
        )
      )
    } catch (err) {
      console.error('toggleAllVisibility error:', err)
    }
  }

  return {
    roles,
    loading,
    addRole,
    updateRole,
    deleteRole,
    toggleRoleVisibility,
    toggleAllVisibility,
  }
}
