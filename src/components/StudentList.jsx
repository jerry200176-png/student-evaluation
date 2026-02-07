import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import ExportReport from './ExportReport'

const pad2 = (value) => String(value).padStart(2, '0')

const formatDate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const formatDateTime = (date) =>
  `${formatDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`

const isIOS = () => /iPad|iPhone|iPod/i.test(navigator.userAgent || '')

const toDateOnly = (dateString) => {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export default function StudentList({
  students,
  deleteStudent,
  onAddRecord,
  onEditStudent,
  onEditRecord,
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState(null)
  const [exportData, setExportData] = useState(null)
  const [exportingId, setExportingId] = useState(null)
  const exportRef = useRef(null)

  const exportLast8Days = async (student) => {
    const today = new Date()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const start = new Date(end)
    start.setDate(end.getDate() - 7)

    const records = (student.records || [])
      .filter((record) => {
        const date = toDateOnly(record.date)
        return date && date >= start && date <= end
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    if (records.length === 0) {
      window.alert('近八天沒有可匯出的記錄')
      return
    }
    const rangeLabel = `${formatDate(start)} ~ ${formatDate(end)}`
    const generatedAt = formatDateTime(new Date())

    const previewWindow = isIOS() ? window.open('', '_blank') : null
    setExportingId(student.id)
    setExportData({
      student,
      records,
      rangeLabel,
      generatedAt,
    })

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
      if (!exportRef.current) {
        window.alert('匯出失敗，請重試')
        return
      }
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })
      if (previewWindow) {
        previewWindow.location.href = dataUrl
        previewWindow.focus()
      } else {
        const fileName = `評量表_${student.name}_${formatDate(start)}-${formatDate(end)}.png`
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch (error) {
      console.error(error)
      window.alert('匯出失敗，請稍後再試')
    } finally {
      setExportData(null)
      setExportingId(null)
    }
  }

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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditStudent(student)
                }}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
              >
                編輯
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDeleteStudentId(
                    confirmDeleteStudentId === student.id ? null : student.id
                  )
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                刪除
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
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportLast8Days(student)
                  }}
                  disabled={exportingId === student.id}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  匯出近 8 天評量表
                </button>
              </div>
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {confirmDeleteStudentId === student.id && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  確定要刪除此學生？此操作無法復原。
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        deleteStudent(student.id)
                        setConfirmDeleteStudentId(null)
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      確認刪除
                    </button>
                    <button
                      onClick={() => setConfirmDeleteStudentId(null)}
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
      {exportData && (
        <div className="fixed left-[-10000px] top-0">
          <ExportReport
            ref={exportRef}
            student={exportData.student}
            records={exportData.records}
            rangeLabel={exportData.rangeLabel}
            generatedAt={exportData.generatedAt}
          />
        </div>
      )}
    </div>
  )
}
