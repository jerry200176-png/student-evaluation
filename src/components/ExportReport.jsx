import { forwardRef } from 'react'

const HOMEWORK_STATUS_LABELS = {
  completed: '已完成',
  partial: '部分完成',
  incomplete: '未完成',
  not_brought: '未攜帶',
}

const cellClass = 'border border-slate-200 px-2 py-2 align-top'

const ExportReport = forwardRef(function ExportReport(
  { student, records, rangeLabel, generatedAt },
  ref
) {
  return (
    <div ref={ref} className="w-[1120px] bg-white text-slate-800 font-sans">
      <div className="border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">學生評量表</h1>
            <p className="text-sm text-slate-500 mt-1">期間：{rangeLabel}</p>
          </div>
          <div className="text-sm text-right text-slate-600 space-y-1">
            <p>
              <span className="text-slate-500">學生姓名：</span>
              {student.name || '—'}
            </p>
            <p>
              <span className="text-slate-500">就讀學校：</span>
              {student.school || '—'}
            </p>
            <p>
              <span className="text-slate-500">上課科目：</span>
              {student.subject || '—'}
            </p>
          </div>
        </div>

        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className={cellClass}>授課日期</th>
              <th className={cellClass}>授課時間</th>
              <th className={cellClass}>上次作業</th>
              <th className={cellClass}>週考成績</th>
              <th className={cellClass}>授課進度</th>
              <th className={cellClass}>下次作業範圍</th>
              <th className={cellClass}>上課狀況</th>
              <th className={cellClass}>學習進度與家長溝通</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="text-slate-700">
                <td className={`${cellClass} whitespace-nowrap`}>{record.date || '—'}</td>
                <td className={`${cellClass} whitespace-nowrap`}>{record.time || '—'}</td>
                <td className={cellClass}>
                  {HOMEWORK_STATUS_LABELS[record.homeworkStatus] || '—'}
                </td>
                <td className={`${cellClass} text-center`}>
                  {record.weeklyScore ?? '—'}
                </td>
                <td className={`${cellClass} whitespace-pre-wrap`}>
                  {record.progress || '—'}
                </td>
                <td className={`${cellClass} whitespace-pre-wrap`}>
                  {record.nextHomework || '—'}
                </td>
                <td className={`${cellClass} text-center`}>
                  {record.classCondition || '—'}
                </td>
                <td className={`${cellClass} whitespace-pre-wrap`}>
                  {record.parentCommunication || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-[10px] text-slate-400 text-right">
          匯出時間：{generatedAt}
        </div>
      </div>
    </div>
  )
})

export default ExportReport
