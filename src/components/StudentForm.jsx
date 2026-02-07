import { useState } from 'react'
import { useStorage } from '../hooks/useStorage'

export default function StudentForm({ onSave, onCancel }) {
  const { addStudent } = useStorage()
  const [form, setForm] = useState({
    name: '',
    school: '',
    subject: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addStudent(form)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">新增學生</h2>

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
          上課科目
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="例：數學、英文"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
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
          disabled={!form.name.trim()}
          className="flex-1 py-3 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          儲存
        </button>
      </div>
    </form>
  )
}
