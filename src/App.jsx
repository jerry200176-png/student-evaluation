import { useState } from 'react'
import StudentList from './components/StudentList'
import StudentForm from './components/StudentForm'
import RecordForm from './components/RecordForm'
import { useStorage } from './hooks/useStorage'

export default function App() {
  const [view, setView] = useState('list') // list | addStudent | editStudent | addRecord | editRecord
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    addRecord,
    updateRecord,
  } = useStorage()

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setView('addStudent')
  }

  const handleAddRecord = (student) => {
    setSelectedStudent(student)
    setSelectedRecord(null)
    setView('addRecord')
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setSelectedRecord(null)
    setView('editStudent')
  }

  const handleEditRecord = (student, record) => {
    setSelectedStudent(student)
    setSelectedRecord(record)
    setView('editRecord')
  }

  const handleBack = () => {
    setView('list')
    setSelectedStudent(null)
    setSelectedRecord(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1e3a5f] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight">學生評量表</h1>
          {view === 'list' && (
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition-colors text-slate-900"
            >
              新增學生
            </button>
          )}
          {(view === 'addStudent' ||
            view === 'editStudent' ||
            view === 'addRecord' ||
            view === 'editRecord') && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-amber-200 hover:text-white transition-colors"
            >
              返回
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {view === 'list' && (
          <StudentList
            students={students}
            deleteStudent={deleteStudent}
            onAddRecord={handleAddRecord}
            onEditStudent={handleEditStudent}
            onEditRecord={handleEditRecord}
          />
        )}
        {view === 'addStudent' && (
          <StudentForm
            onSave={handleBack}
            onCancel={handleBack}
            addStudent={addStudent}
          />
        )}
        {view === 'editStudent' && selectedStudent && (
          <StudentForm
            onSave={handleBack}
            onCancel={handleBack}
            updateStudent={updateStudent}
            initialStudent={selectedStudent}
            isEdit
          />
        )}
        {(view === 'addRecord' || view === 'editRecord') && selectedStudent && (
          <RecordForm
            student={selectedStudent}
            record={selectedRecord}
            onSave={handleBack}
            onCancel={handleBack}
            isEdit={view === 'editRecord'}
            addRecord={addRecord}
            updateRecord={updateRecord}
          />
        )}
      </main>
    </div>
  )
}
