import { useEffect, useState } from 'react'

const parseSubjects = (value) =>
  value
    .split(/[，、,/;]+/)
    .map((item) => item.trim())
    .filter(Boolean)

export default function StudentForm({
  onSave,
  onCancel,
  addStudent,
  updateStudent,
  initialStudent,
  isEdit = false,
}) {
  const [form, setForm] = useState({
    name: initialStudent?.name || '',
    school: initialStudent?.school || '',
  })
  const [subjectsInput, setSubjectsInput] = useState(
    (initialStudent?.subjects?.length
      ? initialStudent.subjects
      : initialStudent?.subject
        ? [initialStudent.subject]
        : []
    ).join(', ')
  )

  useEffect(() => {
    if (initialStudent) {
      setForm({
        name: initialStudent?.name || '',
        school: initialStudent?.school || '',
      })
      const subjects = initialStudent?.subjects?.length
        ? initialStudent.subjects
        : initialStudent?.subject
          ? [initialStudent.subject]
          : []
      setSubjectsInput(subjects.join(', '))
    }
  }, [initialStudent])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const subjects = parseSubjects(subjectsInput)
    const payload = {
      ...form,
      subjects,
    }
    if (isEdit && initialStudent) {
      updateStudent(initialStudent.id, payload)
    } else {
      addStudent(payload)
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {isEdit ? '編輯學生' : '新增學生'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          學生姓名 <span className="text-amber-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="請輸入學生姓名"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          就讀學校
        </label>
        <input
          type="text"
          value={form.school}
          onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          placeholder="請輸入就讀學校"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          上課科目（可多個）
        </label>
        <input
          type="text"
          value={subjectsInput}
          onChange={(e) => setSubjectsInput(e.target.value)}
          placeholder="例：數學, 英文"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
        />
        <p className="text-xs text-slate-400 mt-1">用逗號分隔多個科目</p>
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
          disabled={!form.name.trim()}
          className="flex-1 py-3 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          儲存
        </button>
      </div>
    </form>
  )
}
