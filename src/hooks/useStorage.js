import { useState, useEffect } from 'react'

const STORAGE_KEY = 'student-evaluation-data'

const defaultSettings = {
  academyName: '台北全真一對一補習班',
  logoDataUrl: '',
}

const defaultData = {
  students: [],
  settings: defaultSettings,
}

const normalizeData = (raw) => ({
  ...defaultData,
  ...(raw || {}),
  settings: {
    ...defaultSettings,
    ...((raw && raw.settings) || {}),
  },
})

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return normalizeData(JSON.parse(raw))
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
    setData((prev) => {
      const updated = {
        ...prev,
        students: [...prev.students, newStudent].sort((a, b) =>
          a.name.localeCompare(b.name, 'zh-TW')
        ),
      }
      saveData(updated) // 同步寫入 localStorage，避免切換畫面時資料遺失
      return updated
    })
    return newStudent
  }

  const updateStudent = (id, updates) => {
    setData((prev) => {
      const updated = {
        ...prev,
        students: prev.students.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }
      saveData(updated)
      return updated
    })
  }

  const deleteStudent = (id) => {
    setData((prev) => {
      const updated = {
        ...prev,
        students: prev.students.filter((s) => s.id !== id),
      }
      saveData(updated)
      return updated
    })
  }

  const addRecord = (studentId, record) => {
    const recordId = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const newRecord = { ...record, id: recordId }
    setData((prev) => {
      const updated = {
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
      }
      saveData(updated)
      return updated
    })
    return newRecord
  }

  const updateRecord = (studentId, recordId, updates) => {
    setData((prev) => {
      const updated = {
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
      }
      saveData(updated)
      return updated
    })
  }

  const deleteRecord = (studentId, recordId) => {
    setData((prev) => {
      const updated = {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                records: (s.records || []).filter((r) => r.id !== recordId),
              }
            : s
        ),
      }
      saveData(updated)
      return updated
    })
  }

  const updateSettings = (updates) => {
    setData((prev) => {
      const updated = {
        ...prev,
        settings: {
          ...prev.settings,
          ...updates,
        },
      }
      saveData(updated)
      return updated
    })
  }

  return {
    students: data.students,
    settings: data.settings,
    addStudent,
    updateStudent,
    deleteStudent,
    addRecord,
    updateRecord,
    deleteRecord,
    updateSettings,
    data,
  }
}
