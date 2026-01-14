export function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

