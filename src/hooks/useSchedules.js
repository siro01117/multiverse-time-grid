import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

function toCamel(row) {
  return {
    id: row.id,
    title: row.title,
    roleId: row.role_id,
    day: row.day,
    startMinute: row.start_minute,
    endMinute: row.end_minute,
    memo: row.memo ?? '',
    groupId: row.group_id,
    isDone: row.is_done,
    isScheduled: row.is_scheduled,
  }
}

function toRow(data) {
  return {
    title: data.title,
    role_id: data.roleId,
    day: data.day ?? null,
    start_minute: data.startMinute ?? null,
    end_minute: data.endMinute ?? null,
    memo: data.memo ?? '',
    group_id: data.groupId ?? null,
    is_done: data.isDone ?? false,
    is_scheduled: data.day !== null && data.day !== undefined,
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

async function fetchAll(setSchedules) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at')
    if (error) throw error
    setSchedules(data.map(toCamel))
  } catch (err) {
    console.error('useSchedules fetch error:', err)
  }
}

export function useSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll(setSchedules).then(() => setLoading(false))

    const channel = supabase
      .channel('schedules-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        fetchAll(setSchedules)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addSchedule(data) {
    try {
      const { error } = await supabase.from('schedules').insert(toRow(data))
      if (error) throw error
    } catch (err) {
      console.error('addSchedule error:', err)
    }
  }

  async function addScheduleBatch(dataArray) {
    try {
      const { error } = await supabase.from('schedules').insert(dataArray.map(toRow))
      if (error) throw error
    } catch (err) {
      console.error('addScheduleBatch error:', err)
    }
  }

  async function updateSchedule(id, updates) {
    try {
      const { error } = await supabase
        .from('schedules')
        .update(toUpdateRow(updates))
        .eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('updateSchedule error:', err)
    }
  }

  async function deleteSchedule(id) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('deleteSchedule error:', err)
    }
  }

  async function deleteScheduleGroup(groupId) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('group_id', groupId)
      if (error) throw error
    } catch (err) {
      console.error('deleteScheduleGroup error:', err)
    }
  }

  return {
    schedules,
    loading,
    addSchedule,
    addScheduleBatch,
    updateSchedule,
    deleteSchedule,
    deleteScheduleGroup,
    undo: () => {},
    canUndo: false,
  }
}
