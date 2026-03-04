import { formatCurrency } from '@/shared/utils/currency'

interface PersonBalanceCardProps {
  personName: string
  totalPending: string
  onClick: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getColor(name: string) {
  const colors = [
    'bg-emerald-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-pink-600',
    'bg-cyan-600',
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function PersonBalanceCard({ personName, totalPending, onClick }: PersonBalanceCardProps) {
  const initials = getInitials(personName)
  const color = getColor(personName)
  const pending = parseFloat(totalPending)
  const hasPending = pending > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/50"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
      >
        {initials}
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm font-medium">{personName}</span>
        <span
          className={`text-sm font-semibold ${hasPending ? 'text-[#6ee7a0]' : 'text-muted-foreground'}`}
        >
          {formatCurrency(totalPending)}
        </span>
      </div>
    </button>
  )
}
