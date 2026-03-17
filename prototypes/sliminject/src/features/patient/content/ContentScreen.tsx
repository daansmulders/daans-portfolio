import { useState } from 'react'
import { useEducationalContent, type ContentItem } from './useEducationalContent'
import { CONTENT_GROUPS } from './contentGroups'
import { nl } from '../../../i18n/nl'
import { EmptyState } from '../../../components/EmptyState'

function ArticleView({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  // Eenvoudige markdown renderer: koppen, vetgedrukt, lijsten
  const html = (item.body_markdown ?? '')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-4 mb-2" style="color:#14130F">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc" style="color:#14130F">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3" style="color:#14130F">')

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="page">
        <button
          onClick={onClose}
          className="btn btn-ghost text-sm mb-6 block"
        >
          ← {nl.terug}
        </button>
        <h1 className="text-xl font-semibold mb-6" style={{ color: '#14130F' }}>{item.title}</h1>
        <div
          className="prose prose-sm space-y-3"
          style={{ color: '#14130F' }}
          dangerouslySetInnerHTML={{ __html: `<p class="mb-3" style="color:#14130F">${html}</p>` }}
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

  if (loading) {
    return (
      <main className="page">
        <p className="text-sm" style={{ color: '#6B6660' }}>{nl.laden}</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="page">
        <h1 className="text-xl font-semibold mb-6" style={{ color: '#14130F' }}>{nl.inhoud_titel}</h1>
        <EmptyState heading={nl.empty_inhoud_heading} body={nl.empty_inhoud_body} />
      </main>
    )
  }

  // Group items by contentGroups config order
  const groupedSections = CONTENT_GROUPS.map(group => ({
    group,
    items: items.filter(i => i.groupId === group.id),
  })).filter(s => s.items.length > 0)

  const ungrouped = items.filter(i => i.groupId === null)

  function renderItem(item: ContentItem, isHighlighted = false) {
    return (
      <li key={item.id}>
        <button
          onClick={() => handleOpen(item)}
          className="card card-interactive w-full text-left px-4 py-4"
          style={isHighlighted ? { borderLeft: '3px solid #2D7A5E' } : {}}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="section-label">
                {item.content_type === 'video' ? nl.inhoud_video : nl.inhoud_artikel}
              </span>
              <p className="font-medium mt-0.5" style={{ color: '#14130F' }}>{item.title}</p>
            </div>
            {item.viewed ? (
              <span className="flex-shrink-0 text-xs" style={{ color: '#6B6660' }}>{nl.inhoud_bekeken}</span>
            ) : (
              <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#2D7A5E' }} aria-hidden="true" />
            )}
          </div>
        </button>
      </li>
    )
  }

  return (
    <main className="page space-y-6">
      <h1 className="text-xl font-semibold" style={{ color: '#14130F' }}>{nl.inhoud_titel}</h1>

      {groupedSections.map(({ group, items: groupItems }) => {
        const allViewed = groupItems.every(i => i.viewed)
        const firstUnread = groupItems.find(i => !i.viewed)
        return (
          <section key={group.id}>
            <div className="flex items-center gap-2 mb-3">
              <p className="section-label">{group.label}</p>
              {allViewed && (
                <span className="badge badge-brand" style={{ fontSize: '10px' }}>✓ Voltooid</span>
              )}
            </div>
            <ul className="space-y-2">
              {groupItems.map(item =>
                renderItem(item, group.isRecommendedStart && item.id === firstUnread?.id)
              )}
            </ul>
          </section>
        )
      })}

      {ungrouped.length > 0 && (
        <section>
          <p className="section-label mb-3">{nl.inhoud_titel}</p>
          <ul className="space-y-2">
            {ungrouped.map(item => renderItem(item))}
          </ul>
        </section>
      )}
    </main>
  )
}
