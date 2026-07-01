export default function StatCard({ title, value, icon, color = 'green', sub }) {
  const colors = {
    green:  'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    brown:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`rounded-xl border-2 p-5 ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
