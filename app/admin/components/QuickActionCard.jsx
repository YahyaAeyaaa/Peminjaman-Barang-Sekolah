import Link from 'next/link';

export function QuickActionCard({ title, desc, color, border, href, icon }) {
  return (
    <div
      className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600 text-sm">{desc}</p>
      {href && (
        <Link
          href={href}
          className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
        >
          Kelola →
        </Link>
      )}
    </div>
  );
}

