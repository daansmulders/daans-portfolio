import { nl } from '../../../i18n/nl'

const MILESTONE = 7

interface StreakDisplayProps {
  streakDays: number
}

export function StreakDisplay({ streakDays }: StreakDisplayProps) {
  return (
    <div className="card p-5 text-center space-y-3">
      {streakDays > 0 ? (
        <>
          <p className="text-3xl font-bold" style={{ color: '#1A4A36' }}>
            {nl.streak_label.replace('{n}', String(streakDays))}
          </p>
          <p className="text-sm" style={{ color: '#2D7A5E' }}>
            {nl.streak_voortgang.replace('{n}', String(streakDays))}
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pt-1" aria-hidden="true">
            {Array.from({ length: MILESTONE }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{ backgroundColor: i < streakDays ? '#2D7A5E' : '#E0DBD4' }}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: '#AAA49C' }}>
          {nl.streak_reset}
        </p>
      )}
    </div>
  )
}
