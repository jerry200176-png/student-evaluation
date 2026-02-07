import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import ExportReport from './ExportReport'

const HOMEWORK_STATUS_LABELS = {
  completed: '已完成',
  partial: '部分完成',
  incomplete: '未完成',
  not_brought: '未攜帶',
}

const HOMEWORK_STATUS_ORDER = [
  'completed',
  'partial',
  'incomplete',
  'not_brought',
]

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

const getRecordDateTime = (record) => {
  if (!record?.date) return null
  const time = record.time ? `${record.time}:00` : '00:00:00'
  const date = new Date(`${record.date}T${time}`)
  if (!Number.isNaN(date.getTime())) return date
  return toDateOnly(record.date)
}

const getLast8DaysRange = () => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(end)
  start.setDate(end.getDate() - 7)
  return { start, end }
}

const getLast8DaysRecords = (records) => {
  const { start, end } = getLast8DaysRange()
  return (records || [])
    .filter((record) => {
      const date = toDateOnly(record.date)
      return date && date >= start && date <= end
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

const getLatestRecords = (records, limit = 8) => {
  const sorted = (records || [])
    .map((record) => ({
      ...record,
      _sortTime: getRecordDateTime(record),
    }))
    .filter((record) => record._sortTime)
    .sort((a, b) => b._sortTime - a._sortTime)
  return sorted.slice(0, limit).map(({ _sortTime, ...record }) => record)
}

const getLatestRangeLabel = (records) => {
  if (records.length === 0) return '最新 0 筆'
  const sorted = [...records].sort((a, b) => {
    const timeA = getRecordDateTime(a)
    const timeB = getRecordDateTime(b)
    if (!timeA || !timeB) return 0
    return timeA - timeB
  })
  const start = sorted[0]?.date
  const end = sorted[sorted.length - 1]?.date
  if (!start || !end) return `最新 ${records.length} 筆`
  return `最新 ${records.length} 筆（${start} ~ ${end}）`
}

const parseScore = (value) => {
  if (value == null) return null
  const match = String(value).match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const num = Number(match[0])
  return Number.isNaN(num) ? null : num
}

const getHomeworkStats = (records) =>
  records.reduce(
    (acc, record) => {
      const key = record.homeworkStatus
      if (acc[key] != null) {
        acc[key] += 1
      }
      return acc
    },
    {
      completed: 0,
      partial: 0,
      incomplete: 0,
      not_brought: 0,
    }
  )

const getScoreStats = (records) => {
  const scores = records
    .map((record) => parseScore(record.weeklyScore))
    .filter((score) => score != null)
  if (scores.length === 0) {
    return { average: null, count: 0 }
  }
  const sum = scores.reduce((total, value) => total + value, 0)
  const average = Math.round((sum / scores.length) * 10) / 10
  return { average, count: scores.length }
}

export default function StudentList({
  students,
  settings,
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
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()
  const subjectOptions = Array.from(
    new Set(
      students
        .flatMap((student) => [
          ...(student.subjects || []),
          ...(student.records || []).map((record) => record.subject),
          student.subject,
        ])
        .filter(Boolean)
    )
  )
  const filteredStudents = students.filter((student) => {
    const subjectLabel = student.subjects?.length
      ? student.subjects.join(' ')
      : student.subject || ''
    const recordSubjects = (student.records || [])
      .map((record) => record.subject)
      .filter(Boolean)
      .join(' ')
    const matchesQuery =
      !normalizedQuery ||
      [student.name, student.school, subjectLabel, recordSubjects]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesSubject =
      subjectFilter === 'all' ||
      student.subjects?.includes(subjectFilter) ||
      student.subject === subjectFilter ||
      (student.records || []).some((record) => record.subject === subjectFilter)
    return matchesQuery && matchesSubject
  })

  const exportLast8Days = async (student) => {
    const latestRecords = getLatestRecords(student.records, 8)

    if (latestRecords.length === 0) {
      window.alert('目前沒有可匯出的記錄')
      return
    }
    const rangeLabel = getLatestRangeLabel(latestRecords)
    const generatedAt = formatDateTime(new Date())

    const previewWindow = isIOS() ? window.open('', '_blank') : null
    setExportingId(student.id)
    const subjectsLabel = student.subjects?.length
      ? student.subjects.join(' / ')
      : student.subject || ''
    setExportData({
      student,
      records: [...latestRecords]
        .map((record) => ({
          ...record,
          subject:
            record.subject || student.subjects?.[0] || student.subject || '',
        }))
        .sort((a, b) => getRecordDateTime(a) - getRecordDateTime(b)),
      rangeLabel,
      generatedAt,
      academyName: settings?.academyName,
      logoDataUrl: settings?.logoDataUrl,
      teacherName: settings?.teacherName,
      subjectsLabel,
    })

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
      if (!exportRef.current) {
        window.alert('匯出失敗，請重試')
        return
      }
      const element = exportRef.current
      const exportWidth = element.scrollWidth || element.offsetWidth || 1120
      const exportHeight = element.scrollHeight || element.offsetHeight || 800
      const maxSide = isIOS() ? 2048 : 4096
      const scale = Math.min(2, maxSide / Math.max(exportWidth, exportHeight))
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
      })
      const blob = await new Promise((resolve) =>
        canvas.toBlob((result) => resolve(result), 'image/png', 1)
      )
      const dataUrl = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png')
      if (previewWindow) {
        previewWindow.location.href = dataUrl
        previewWindow.focus()
      } else {
        const fileName = `評量表_${student.name}_最新${latestRecords.length}筆.png`
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        if (blob) {
          URL.revokeObjectURL(dataUrl)
        }
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">搜尋學生</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="輸入姓名、學校或科目"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">科目篩選</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            >
              <option value="all">全部科目</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          顯示 {filteredStudents.length} / {students.length} 位學生
        </p>
      </div>
      {filteredStudents.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          沒有符合條件的學生
        </div>
      ) : (
        filteredStudents.map((student) => {
        const last8Records = getLast8DaysRecords(student.records)
        const homeworkStats = getHomeworkStats(last8Records)
        const scoreStats = getScoreStats(last8Records)
        return (
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
                {student.school} ·{' '}
                {student.subjects?.length
                  ? student.subjects.join(' / ')
                  : student.subject || '未設定科目'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500 mb-1">近 8 天作業完成度</p>
                  <p className="text-sm text-slate-700">
                    {HOMEWORK_STATUS_ORDER.map((key) => (
                      <span key={key} className="mr-2">
                        {HOMEWORK_STATUS_LABELS[key]} {homeworkStats[key]}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    記錄 {last8Records.length} 次
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500 mb-1">近 8 天週考平均</p>
                  <p className="text-sm text-slate-700">
                    {scoreStats.average != null ? scoreStats.average : '—'}
                    {scoreStats.count > 0 && (
                      <span className="text-xs text-slate-400 ml-2">
                        ({scoreStats.count} 次)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">分數可輸入數字</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportLast8Days(student)
                  }}
                  disabled={exportingId === student.id}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  匯出最新 8 筆評量表
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
                        {record.subject && (
                          <span className="text-slate-500 text-sm ml-2">
                            {record.subject}
                          </span>
                        )}
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
        )
        })
      )}
      {exportData && (
        <div className="fixed inset-0 z-50 bg-white/95 overflow-auto">
          <div className="px-6 pt-6 pb-2 text-sm text-slate-500">
            正在產生評量表圖片，請稍候…
          </div>
          <div className="p-6">
            <ExportReport
              ref={exportRef}
              student={exportData.student}
              records={exportData.records}
              rangeLabel={exportData.rangeLabel}
              generatedAt={exportData.generatedAt}
              academyName={exportData.academyName}
              logoDataUrl={exportData.logoDataUrl}
            teacherName={exportData.teacherName}
              subjectsLabel={exportData.subjectsLabel}
            />
          </div>
        </div>
      )}
    </div>
  )
}
