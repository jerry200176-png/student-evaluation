import { useState, useEffect } from 'react'

const HOMEWORK_STATUS = [
  { value: 'completed', label: '已完成' },
  { value: 'partial', label: '部分完成' },
  { value: 'incomplete', label: '未完成' },
  { value: 'not_brought', label: '未攜帶' },
]

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toISOString().split('T')[0]
}

export default function RecordForm({ student, record, onSave, onCancel, isEdit, addRecord, updateRecord }) {
  const [form, setForm] = useState({
    date: formatDate(new Date()),
    time: '',
    homeworkStatus: '',
    weeklyScore: '',
    progress: '',
    nextHomework: '',
    classCondition: '',
    parentCommunication: '',
  })

  useEffect(() => {
    if (record) {
      setForm({
        date: record.date || formatDate(new Date()),
        time: record.time || '',
        homeworkStatus: record.homeworkStatus || '',
        weeklyScore: record.weeklyScore ?? '',
        progress: record.progress || '',
        nextHomework: record.nextHomework || '',
        classCondition: record.classCondition || '',
        parentCommunication: record.parentCommunication || '',
      })
    }
  }, [record])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      weeklyScore: form.weeklyScore === '' ? undefined : form.weeklyScore,
    }
    if (isEdit && record) {
      updateRecord(student.id, record.id, payload)
    } else {
      addRecord(student.id, payload)
    }
    onSave()
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 rounded-lg px-4 py-2 border border-amber-200">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{student.name}</span>
          {' · '}
          {student.school} · {student.subject}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-slate-800">
          {isEdit ? '編輯上課記錄' : '新增上課記錄'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              授課日期 <span className="text-amber-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              授課時間
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            上次作業
          </label>
          <div className="flex flex-wrap gap-2">
            {HOMEWORK_STATUS.map((opt) => (
              <label
                key={opt.value}
                className={`px-4 py-2 rounded-lg border cursor-pointer transition ${
                  form.homeworkStatus === opt.value
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="homeworkStatus"
                  value={opt.value}
                  checked={form.homeworkStatus === opt.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, homeworkStatus: e.target.value }))
                  }
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            週考成績
          </label>
          <input
            type="text"
            value={form.weeklyScore}
            onChange={(e) =>
              setForm((f) => ({ ...f, weeklyScore: e.target.value }))
            }
            placeholder="例：85 分"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            授課進度
          </label>
          <textarea
            value={form.progress}
            onChange={(e) =>
              setForm((f) => ({ ...f, progress: e.target.value }))
            }
            placeholder="記錄本次上課的進度與內容"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            下次作業範圍
          </label>
          <textarea
            value={form.nextHomework}
            onChange={(e) =>
              setForm((f) => ({ ...f, nextHomework: e.target.value }))
            }
            placeholder="指定下次要完成的作業範圍"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            上課狀況
          </label>
          <textarea
            value={form.classCondition}
            onChange={(e) =>
              setForm((f) => ({ ...f, classCondition: e.target.value }))
            }
            placeholder="記錄學生的上課態度、專注度等"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            學習進度與家長溝通
          </label>
          <textarea
            value={form.parentCommunication}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                parentCommunication: e.target.value,
              }))
            }
            placeholder="記錄與家長溝通的內容、學習進度說明等"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-600 transition-colors"
          >
            儲存
          </button>
        </div>
      </form>
    </div>
  )
}
