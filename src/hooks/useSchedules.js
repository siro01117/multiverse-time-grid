import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

function toCamel(row) {
  return {
    id: row.id, title: row.title, roleId: row.role_id,
    day: row.day, startMinute: row.start_minute, endMinute: row.end_minute,
    memo: row.memo ?? '', groupId: row.group_id,
    isDone: row.is_done, isScheduled: row.is_scheduled,
  }
}

function toRow(data) {
  return {
    title: data.title, role_id: data.roleId,
    day: data.day ?? null, start_minute: data.startMinute ?? null, end_minute: data.endMinute ?? null,
    memo: data.memo ?? '', group_id: data.groupId ?? null,
    is_done: data.isDone ?? false, is_scheduled: data.day != null,
  }
}

function toUpdateRow(updates) {
  const row = {}
  if ('title' in updates) row.title = updates.title
  if ('roleId' in updates) row.role_id = updates.roleId
  if ('day' in updates) row.day = updates.day
  if ('startMinute' in updates) row.start_minute = updates.startMinute
  if ('endMinute' in updates) row.end_minute = updates.endMinute
  if ('memo' in updates) row.memo = updates.memo
  if ('groupId' in updates) row.group_id = updates.groupId
  if ('isDone' in updates) row.is_done = updates.isDone
  if ('isScheduled' in updates) row.is_scheduled = updates.isScheduled
  if ('color' in updates) row.color = updates.color
  return row
}

export function useSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('schedules').select('*').order('created_at')
      .then(({ data, error }) => {
        if (!error) setSchedules(data.map(toCamel))
        else console.error('useSchedules fetch error:', error)
        setLoading(false)
      })

    const channel = supabase
      .channel('schedules-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'schedules' },
        ({ new: row }) => setSchedules(prev =>
          prev.some(s => s.id === row.id) ? prev : [...prev, toCamel(row)]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'schedules' },
        ({ new: row }) => setSchedules(prev => prev.map(s => s.id === row.id ? toCamel(row) : s)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'schedules' },
        ({ old: row }) => setSchedules(prev => prev.filter(s => s.id !== row.id)))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addSchedule(data) {
    const tempId = `temp-${Date.now()}`
    setSchedules(prev => [...prev, { id: tempId, memo: '', groupId: null, isDone: false, isScheduled: data.day != null, ...data }])
    try {
      const { data: saved, error } = await supabase.from('schedules').insert(toRow(data)).select().single()
      if (error) throw error
      setSchedules(prev => prev.map(s => s.id === tempId ? toCamel(saved) : s))
    } catch (err) {
      console.error('addSchedule error:', err)
      setSchedules(prev => prev.filter(s => s.id !== tempId))
    }
  }

  async function addScheduleBatch(dataArray) {
    const tempItems = dataArray.map((data, i) => ({
      id: `temp-${Date.now()}-${i}`, memo: '', groupId: null, isDone: false,
      isScheduled: data.day != null, ...data,
    }))
    setSchedules(prev => [...prev, ...tempItems])
    try {
      const { data: saved, error } = await supabase.from('schedules').insert(dataArray.map(toRow)).select()
      if (error) throw error
      const tempIds = new Set(tempItems.map(t => t.id))
      setSchedules(prev => [...prev.filter(s => !tempIds.has(s.id)), ...saved.map(toCamel)])
    } catch (err) {
      console.error('addScheduleBatch error:', err)
      const tempIds = new Set(tempItems.map(t => t.id))
      setSchedules(prev => prev.filter(s => !tempIds.has(s.id)))
    }
  }

  async function updateSchedule(id, updates) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    try {
      const { error } = await supabase.from('schedules').update(toUpdateRow(updates)).eq('id', id)
      if (error) throw error
    } catch (err) { console.error('updateSchedule error:', err) }
  }

  async function deleteSchedule(id) {
    setSchedules(prev => prev.filter(s => s.id !== id))
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id)
      if (error) throw error
    } catch (err) { console.error('deleteSchedule error:', err) }
  }

  async function deleteScheduleGroup(groupId) {
    setSchedules(prev => prev.filter(s => s.groupId !== groupId))
    try {
      const { error } = await supabase.from('schedules').delete().eq('group_id', groupId)
      if (error) throw error
    } catch (err) { console.error('deleteScheduleGroup error:', err) }
  }

  return {
    schedules, loading, addSchedule, addScheduleBatch,
    updateSchedule, deleteSchedule, deleteScheduleGroup,
    undo: () => {}, canUndo: false,
  }
}
