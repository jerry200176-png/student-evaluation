import { useState } from 'react'
import StudentList from './components/StudentList'
import StudentForm from './components/StudentForm'
import RecordForm from './components/RecordForm'
import RemindersPanel from './components/RemindersPanel'
import SettingsPanel from './components/SettingsPanel'
import { useStorage } from './hooks/useStorage'

export default function App() {
  const [view, setView] = useState('list') // list | addStudent | editStudent | addRecord | editRecord
  const [activeTab, setActiveTab] = useState('students') // students | reminders | settings
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const {
    students,
    settings,
    data,
    addStudent,
    updateStudent,
    deleteStudent,
    addRecord,
    updateRecord,
    updateSettings,
    importData,
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

  const handleExportBackup = () => {
    const payload = {
      ...data,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `學生評量表備份_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportBackup = (payload) => {
    importData(payload)
    window.alert('匯入完成')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1e3a5f] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4 max-w-2xl mx-auto">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {settings.academyName || '台北全真一對一補習班'}
            </h1>
            <p className="text-xs text-amber-100/90">學生評量表</p>
          </div>
          {view === 'list' && activeTab === 'students' && (
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
          <>
            <div className="grid grid-cols-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 text-sm font-medium ${
                  activeTab === 'students'
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                學生
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`py-2 text-sm font-medium ${
                  activeTab === 'reminders'
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                提醒
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                設定
              </button>
            </div>
            {activeTab === 'students' && (
              <StudentList
                students={students}
                settings={settings}
                deleteStudent={deleteStudent}
                onAddRecord={handleAddRecord}
                onEditStudent={handleEditStudent}
                onEditRecord={handleEditRecord}
              />
            )}
            {activeTab === 'reminders' && <RemindersPanel students={students} />}
            {activeTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                updateSettings={updateSettings}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
              />
            )}
          </>
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
            lastRecord={selectedStudent.records?.[0]}
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
