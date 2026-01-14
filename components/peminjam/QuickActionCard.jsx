import Button from '@/components/button';

export default function QuickActionCard({ title, desc, color, border, onClick }) {
  return (
    <div
      className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 shadow-sm`}
    >
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{desc}</p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 px-0 text-sm font-semibold text-blue-600 hover:underline"
        onClick={onClick}
      >
        Lihat detail →
      </Button>
    </div>
  );
}