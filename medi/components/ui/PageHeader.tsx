export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex animate-fade-up flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="title-page text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-teal-400 align-middle" />
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
