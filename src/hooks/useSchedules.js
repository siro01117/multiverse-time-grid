import { useState, useEffect } from 'react'

const SCHEDULES_KEY = 'mtg_schedules_v5'

function loadSchedules() {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSchedules(schedules) {
  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules))
  } catch {
    // ignore quota errors
  }
}

function generateId() {
  return `sched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function useSchedules() {
  // Combined state so history snapshots and schedules stay in sync
  const [state, setState] = useState(() => ({
    schedules: loadSchedules() ?? [],
    history: [],
  }))

  const { schedules, history } = state

  useEffect(() => {
    saveSchedules(schedules)
  }, [schedules])

  // Runs an updater on schedules, pushing current schedules onto history first
  function withHistory(updater) {
    setState(prev => ({
      schedules: updater(prev.schedules),
      history: [...prev.history.slice(-19), prev.schedules],
    }))
  }

  function addSchedule(data) {
    withHistory(prev => [
      ...prev,
      { memo: '', groupId: null, ...data, id: generateId() },
    ])
  }

  // Add multiple schedules as a single undoable step
  function addScheduleBatch(dataArray) {
    withHistory(prev => [
      ...prev,
      ...dataArray.map(data => ({ memo: '', groupId: null, ...data, id: generateId() })),
    ])
  }

  function updateSchedule(id, updates) {
    withHistory(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  function deleteSchedule(id) {
    withHistory(prev => prev.filter(s => s.id !== id))
  }

  function deleteScheduleGroup(groupId) {
    withHistory(prev => prev.filter(s => s.groupId !== groupId))
  }

  function undo() {
    setState(prev => {
      if (prev.history.length === 0) return prev
      return {
        schedules: prev.history[prev.history.length - 1],
        history: prev.history.slice(0, -1),
      }
    })
  }

  return {
    schedules,
    addSchedule,
    addScheduleBatch,
    updateSchedule,
    deleteSchedule,
    deleteScheduleGroup,
    undo,
    canUndo: history.length > 0,
  }
}
