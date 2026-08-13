const styles: Record<string, string> = {
  PAID: 'chip chip-emerald',
  COMPLETED: 'chip chip-emerald',
  CONFIRMED: 'chip chip-blue',
  IN_PROGRESS: 'chip chip-blue',
  SCHEDULED: 'chip chip-amber',
  PENDING: 'chip chip-amber',
  SAMPLE_COLLECTED: 'chip chip-violet',
  OVERDUE: 'chip chip-red',
  CANCELLED: 'chip chip-red',
  NO_SHOW: 'chip chip-red',
  REFUNDED: 'chip chip-gray',
}

const dots: Record<string, string> = {
  PAID: 'bg-emerald-400',
  COMPLETED: 'bg-emerald-400',
  CONFIRMED: 'bg-blue-400',
  IN_PROGRESS: 'bg-blue-400',
  SCHEDULED: 'bg-amber-400',
  PENDING: 'bg-amber-400',
  SAMPLE_COLLECTED: 'bg-violet-400',
  OVERDUE: 'bg-red-400',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-red-400',
  REFUNDED: 'bg-slate-400',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'chip chip-gray'
  const dot = dots[status] ?? 'bg-slate-400'
  return (
    <span className={cls}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dot} animate-pulse-glow`} />
      {status.replaceAll('_', ' ')}
    </span>
  )
}
