interface TipCardProps {
  heading: string
  body: string
  symptom: string
}

function SymptomIcon({ symptom }: { symptom: string }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: '#2D7A5E', strokeWidth: 1.6 }

  if (symptom === 'Misselijkheid' || symptom === 'Maagklachten') {
    return (
      <svg {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    )
  }

  if (symptom === 'Vermoeidheid') {
    return (
      <svg {...props}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  }

  if (symptom === 'Hoofdpijn' || symptom === 'Duizeligheid') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    )
  }

  if (symptom === 'Haaruitval') {
    return (
      <svg {...props}>
        <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    )
  }

  if (symptom === 'Injectieplaatsreactie') {
    return (
      <svg {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    )
  }

  // Default: leaf icon for general
  return (
    <svg {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

export function TipCard({ heading, body, symptom }: TipCardProps) {
  return (
    <div
      className="card px-4 py-3 space-y-1"
      style={{ background: '#FAF8F5', borderLeft: '2px solid #2D7A5E' }}
    >
      <div className="flex items-start gap-2">
        <SymptomIcon symptom={symptom} />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold" style={{ color: '#1A4A36' }}>
            {heading}
          </p>
          <p className="text-sm" style={{ color: '#2E2B24' }}>
            {body}
          </p>
        </div>
      </div>
    </div>
  )
}
