import { useState, useEffect } from 'react'

const STORAGE_KEY = 'student-evaluation-data'

const defaultData = {
  students: [],
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return { ...defaultData }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export function useStorage() {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const addStudent = (student) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const newStudent = { ...student, id, records: [] }
    setData((prev) => ({
      ...prev,
      students: [...prev.students, newStudent].sort((a, b) =>
        a.name.localeCompare(b.name, 'zh-TW')
      ),
    }))
    return newStudent
  }

  const updateStudent = (id, updates) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }))
  }

  const deleteStudent = (id) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }))
  }

  const addRecord = (studentId, record) => {
    const recordId = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const newRecord = { ...record, id: recordId }
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              records: [newRecord, ...(s.records || [])].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
              ),
            }
          : s
      ),
    }))
    return newRecord
  }

  const updateRecord = (studentId, recordId, updates) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              records: (s.records || []).map((r) =>
                r.id === recordId ? { ...r, ...updates } : r
              ).sort((a, b) => new Date(b.date) - new Date(a.date)),
            }
          : s
      ),
    }))
  }

  const deleteRecord = (studentId, recordId) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              records: (s.records || []).filter((r) => r.id !== recordId),
            }
          : s
      ),
    }))
  }

  return {
    students: data.students,
    addStudent,
    updateStudent,
    deleteStudent,
    addRecord,
    updateRecord,
    deleteRecord,
  }
}
