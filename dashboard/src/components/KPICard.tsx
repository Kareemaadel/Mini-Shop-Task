interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple';
  loading?: boolean;
}

const colorMap = {
  blue: 'bg-primary-50 text-primary-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function KPICard({ title, value, icon, color, loading }: KPICardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-main">{value}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
