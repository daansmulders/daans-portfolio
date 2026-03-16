import { useState } from 'react'
import { useEducationalContent, type ContentItem } from './useEducationalContent'
import { nl } from '../../../i18n/nl'

function ArticleView({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  // Eenvoudige markdown renderer: koppen, vetgedrukt, lijsten
  const html = (item.body_markdown ?? '')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-gray-900 mt-4 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 mb-3">')

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={onClose}
          className="text-sm text-blue-600 hover:underline mb-6 block focus:outline-none focus:underline"
        >
          ← {nl.terug}
        </button>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{item.title}</h1>
        <div
          className="prose prose-sm text-gray-700 space-y-3"
          dangerouslySetInnerHTML={{ __html: `<p class="text-gray-700 mb-3">${html}</p>` }}
        />
      </div>
    </div>
  )
}

export function ContentScreen() {
  const { items, loading, markViewed } = useEducationalContent()
  const [open, setOpen] = useState<ContentItem | null>(null)

  function handleOpen(item: ContentItem) {
    setOpen(item)
    if (!item.viewed) markViewed(item.id)
  }

  if (open) return <ArticleView item={open} onClose={() => setOpen(null)} />

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">{nl.inhoud_titel}</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">{nl.laden}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm mt-4">{nl.inhoud_leeg}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => handleOpen(item)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl px-4 py-4 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.content_type === 'video' ? nl.inhoud_video : nl.inhoud_artikel}
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">{item.title}</p>
                  </div>
                  {item.viewed ? (
                    <span className="flex-shrink-0 text-xs text-gray-500">{nl.inhoud_bekeken}</span>
                  ) : (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" aria-hidden="true" />
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
