import { useEffect, useState } from 'react'

const MAX_LOGO_SIZE_MB = 1

export default function SettingsPanel({
  settings,
  updateSettings,
  onExportBackup,
  onImportBackup,
}) {
  const [academyName, setAcademyName] = useState(settings.academyName || '')
  const [teacherName, setTeacherName] = useState(settings.teacherName || '')

  useEffect(() => {
    setAcademyName(settings.academyName || '')
    setTeacherName(settings.teacherName || '')
  }, [settings.academyName, settings.teacherName])

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const sizeMb = file.size / 1024 / 1024
    if (sizeMb > MAX_LOGO_SIZE_MB) {
      window.alert(`Logo 建議小於 ${MAX_LOGO_SIZE_MB}MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateSettings({ logoDataUrl: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleImportFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!Array.isArray(parsed?.students)) {
          window.alert('備份格式不正確，請確認 JSON 檔案')
          return
        }
        const ok = window.confirm('匯入後會覆蓋目前所有資料，是否繼續？')
        if (!ok) return
        onImportBackup(parsed)
      } catch (error) {
        console.error(error)
        window.alert('JSON 解析失敗，請確認檔案內容')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const handleSaveName = () => {
    const trimmed = academyName.trim()
    if (!trimmed) {
      window.alert('補習班名稱不能為空白')
      setAcademyName(settings.academyName || '')
      return
    }
    updateSettings({
      academyName: trimmed,
      teacherName: teacherName.trim(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">補習班資訊</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              補習班名稱
            </label>
            <input
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              老師姓名
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="可留空"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleSaveName}
            className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-600"
          >
            儲存
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 overflow-hidden">
              {settings.logoDataUrl ? (
                <img
                  src={settings.logoDataUrl}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                '無'
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block text-sm text-slate-600"
              />
              {settings.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => updateSettings({ logoDataUrl: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  移除 Logo
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Logo 只會儲存在本機，建議尺寸為正方形。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">資料備份</h2>
        <p className="text-sm text-slate-600">
          匯出目前所有學生與記錄，方便在不同裝置備份。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onExportBackup}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900"
          >
            匯出備份（JSON）
          </button>
          <label className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 cursor-pointer text-center">
            匯入備份（JSON）
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
