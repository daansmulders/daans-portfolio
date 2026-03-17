import { useState, useEffect } from 'react'
import { useAdvice } from './useAdvice'
import { nl } from '../../../i18n/nl'
import { showSuccess, showError } from '../../../lib/toast'

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
      showSuccess(nl.opgeslagen)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      showError(nl.toast_fout)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">{nl.laden}</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#2D7A5E' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6 5.5V8.5M6 3.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {nl.advies_zichtbaar}
      </div>
      <textarea
        rows={4}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={nl.dokter_advies_placeholder}
        className="input w-full resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !body.trim()}
          className="btn btn-primary btn-sm disabled:opacity-50"
        >
          {saving ? nl.laden : nl.opslaan}
        </button>
        {saved && <span role="status" className="text-sm text-green-600">{nl.opgeslagen}</span>}
      </div>
    </div>
  )
}
