const toDateOnly = (dateString) => {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const getLatestRecord = (records) =>
  (records || []).reduce((latest, record) => {
    const recordDate = toDateOnly(record.date)
    if (!recordDate) return latest
    if (!latest) return record
    const latestDate = toDateOnly(latest.date)
    return latestDate && recordDate > latestDate ? record : latest
  }, null)

export default function RemindersPanel({ students }) {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4 opacity-40">🗓️</div>
        <p className="text-slate-600 mb-2">尚無學生資料</p>
        <p className="text-sm text-slate-500">新增學生後會出現提醒清單</p>
      </div>
    )
  }

  const reminderItems = students
    .map((student) => {
      const latestRecord = getLatestRecord(student.records)
      return {
        student,
        latestRecord,
        latestDate: latestRecord ? toDateOnly(latestRecord.date) : null,
      }
    })
    .sort((a, b) => {
      if (!a.latestDate && !b.latestDate) return 0
      if (!a.latestDate) return 1
      if (!b.latestDate) return -1
      return b.latestDate - a.latestDate
    })

  return (
    <div className="space-y-4">
      {reminderItems.map(({ student, latestRecord }) => (
        <div
          key={student.id}
          className="bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{student.name}</h3>
              <p className="text-sm text-slate-500">
                {student.school} · {student.subject}
              </p>
            </div>
            <div className="text-sm text-slate-500 text-right">
              <div>最近上課</div>
              <div className="font-medium text-slate-700">
                {latestRecord?.date || '—'}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="text-slate-500">下次作業：</span>
            {latestRecord?.nextHomework || '尚未填寫'}
          </div>
        </div>
      ))}
    </div>
  )
}
