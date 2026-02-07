import { useState } from 'react'
import { useStorage } from '../hooks/useStorage'

export default function StudentList({ onAddRecord, onEditRecord }) {
  const { students, deleteStudent } = useStorage()
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (students.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4 opacity-40">📋</div>
        <p className="text-slate-600 mb-2">尚無學生資料</p>
        <p className="text-sm text-slate-500">點擊上方「新增學生」開始記錄</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
        >
          <div
            className="p-4 flex items-center justify-between"
            onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-800 truncate">
                {student.name}
              </h3>
              <p className="text-sm text-slate-500 truncate">
                {student.school} · {student.subject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddRecord(student)
                }}
                className="px-3 py-1.5 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-600"
              >
                新增記錄
              </button>
              <span
                className={`text-slate-400 transition-transform ${
                  expandedId === student.id ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </div>
          </div>

          {expandedId === student.id && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-4">
              {(student.records || []).length === 0 ? (
                <p className="text-sm text-slate-500 py-2">尚無上課記錄</p>
              ) : (
                <ul className="space-y-2">
                  {(student.records || []).slice(0, 10).map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100"
                    >
                      <div>
                        <span className="font-medium text-slate-700">
                          {record.date}
                        </span>
                        <span className="text-slate-500 text-sm ml-2">
                          {record.time}
                        </span>
                        {record.weeklyScore != null && (
                          <span className="ml-2 text-amber-600 font-medium">
                            週考 {record.weeklyScore}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditRecord(student, record)}
                          className="text-sm text-amber-600 hover:text-amber-700"
                        >
                          編輯
                        </button>
                        {confirmDelete?.studentId === student.id &&
                        confirmDelete?.recordId === record.id ? (
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-sm text-slate-500"
                          >
                            取消
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {confirmDelete?.studentId === student.id && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  確定要刪除此學生？此操作無法復原。
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        deleteStudent(confirmDelete.studentId)
                        setConfirmDelete(null)
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      確認刪除
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1 bg-slate-200 rounded"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
