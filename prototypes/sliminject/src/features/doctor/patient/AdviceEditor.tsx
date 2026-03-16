import { useState, useEffect } from 'react'
import { useAdvice } from './useAdvice'
import { nl } from '../../../i18n/nl'

export function AdviceEditor({ patientId }: { patientId: string }) {
  const { advice, loading, saveAdvice } = useAdvice(patientId)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (advice) setBody(advice.body)
  }, [advice])

  async function handleSave() {
    if (!body.trim()) return
    setSaving(true)
    try {
      await saveAdvice(body)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">{nl.laden}</p>

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={nl.dokter_advies_placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !body.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {saving ? nl.laden : nl.opslaan}
        </button>
        {saved && <span role="status" className="text-sm text-green-600">{nl.opgeslagen}</span>}
      </div>
    </div>
  )
}
