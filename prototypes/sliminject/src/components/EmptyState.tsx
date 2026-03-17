import { Link } from 'react-router-dom'

interface EmptyStateProps {
  heading: string
  body: string
  cta?: { label: string; href: string }
}

export function EmptyState({ heading, body, cta }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <p className="font-semibold mb-2" style={{ color: '#14130F' }}>{heading}</p>
      <p className="text-sm mb-5" style={{ color: '#AAA49C' }}>{body}</p>
      {cta && (
        <Link to={cta.href} className="btn btn-primary">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
